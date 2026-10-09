"""
Version-aware rule evolution: diff incoming rulesets, supersede changed clauses, preserve history.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

from app.graph_client import MockGraphClient, Neo4jAuraClient, BaseGraphClient
from app.schema import ExtractedRuleSetInput

logger = logging.getLogger(__name__)


def _clause_signature(clause_type: str, payload: Dict[str, Any]) -> Tuple[Any, ...]:
    if clause_type == "condition":
        return (
            payload.get("field"),
            payload.get("operator"),
            str(payload.get("value")),
            payload.get("unit"),
            payload.get("depends_on_field"),
        )
    if clause_type == "exclusion":
        return (
            payload.get("field"),
            payload.get("operator"),
            str(payload.get("value")),
            payload.get("unit"),
        )
    if clause_type == "document":
        return (payload.get("document_type"), payload.get("required_for"))
    if clause_type == "benefit":
        return (
            payload.get("benefit_type"),
            str(payload.get("amount")),
            payload.get("frequency"),
        )
    return (json.dumps(payload, sort_keys=True),)


class RuleEvolutionEngine:
    """Incrementally version scheme clauses when an amended notification arrives."""

    def __init__(self, client: BaseGraphClient):
        self.client = client

    def evolve_ruleset(
        self, ruleset_data: Union[Dict[str, Any], ExtractedRuleSetInput, str, Path]
    ) -> Dict[str, Any]:
        if isinstance(ruleset_data, (str, Path)):
            path = Path(ruleset_data)
            with open(path, "r", encoding="utf-8") as f:
                ruleset_dict = json.load(f)
            ruleset = ExtractedRuleSetInput.model_validate(ruleset_dict)
        elif isinstance(ruleset_data, dict):
            ruleset = ExtractedRuleSetInput.model_validate(ruleset_data)
        elif isinstance(ruleset_data, ExtractedRuleSetInput):
            ruleset = ruleset_data
        else:
            raise ValueError(f"Unsupported ruleset input type: {type(ruleset_data)}")

        if isinstance(self.client, MockGraphClient):
            return self._evolve_mock(ruleset)
        if isinstance(self.client, Neo4jAuraClient):
            return self._evolve_neo4j(ruleset)
        raise NotImplementedError("Rule evolution requires MockGraphClient or Neo4jAuraClient.")

    def _evolve_mock(self, ruleset: ExtractedRuleSetInput) -> Dict[str, Any]:
        mock = self.client
        assert isinstance(mock, MockGraphClient)
        scheme_id = ruleset.notification_id
        timestamp_now = datetime.now(timezone.utc).isoformat()
        changed: List[str] = []
        unchanged: List[str] = []
        superseded: List[str] = []

        existing_scheme = mock.nodes.get(scheme_id)
        if not existing_scheme:
            from app.graph_builder import GraphBuilder

            return GraphBuilder(client=mock).ingest_ruleset(ruleset)

        mock.merge_node(
            "Scheme",
            scheme_id,
            {
                "name": ruleset.scheme_name or scheme_id,
                "source_language": ruleset.source_language,
                "version": ruleset.version,
                "valid_from": existing_scheme.get("valid_from", timestamp_now),
                "valid_to": None,
            },
        )

        active_conditions = self._active_nodes(mock, scheme_id, "HAS_CONDITION")
        active_by_field = {n.get("field"): n for n in active_conditions if n.get("field")}

        condition_id_map: Dict[str, str] = {}
        for cond in ruleset.conditions:
            field = cond.field
            incoming = {
                "field": cond.field,
                "operator": cond.operator,
                "value": cond.value,
                "unit": cond.unit,
                "depends_on_field": cond.depends_on_field,
                "raw_text": cond.raw_text,
            }
            current = active_by_field.get(field)
            if current and _clause_signature("condition", current) == _clause_signature(
                "condition", incoming
            ):
                condition_id_map[field] = current["id"]
                unchanged.append(f"condition:{field}")
                continue

            if current:
                current_id = current["id"]
                mock.nodes[current_id]["valid_to"] = timestamp_now
                mock.nodes[current_id]["is_current"] = False
                superseded.append(current_id)
                self._remove_scheme_edge(mock, scheme_id, "HAS_CONDITION", current_id)

            cid = ExtractedRuleSetInput.generate_clause_id(
                scheme_id, "condition", field, ruleset.version
            )
            condition_id_map[field] = cid
            mock.merge_node(
                "Condition",
                cid,
                {
                    "scheme_id": scheme_id,
                    "field": cond.field,
                    "operator": cond.operator,
                    "value": cond.value,
                    "unit": cond.unit,
                    "raw_text": cond.raw_text,
                    "version": ruleset.version,
                    "valid_from": timestamp_now,
                    "valid_to": None,
                    "is_current": True,
                    "depends_on_field": cond.depends_on_field,
                },
            )
            mock.merge_relationship(scheme_id, "HAS_CONDITION", cid)
            if current:
                mock.merge_relationship(current_id, "AMENDED_BY", cid)
            changed.append(f"condition:{field}")

        for cond in ruleset.conditions:
            if cond.depends_on_field and cond.depends_on_field in condition_id_map:
                mock.merge_relationship(
                    condition_id_map[cond.field],
                    "DEPENDS_ON",
                    condition_id_map[cond.depends_on_field],
                )

        self._evolve_simple_collection(
            mock,
            ruleset,
            scheme_id,
            timestamp_now,
            "documents",
            "document",
            "HAS_DOCUMENT",
            lambda d, i: {
                "document_type": d.document_type,
                "required_for": d.required_for,
                "raw_text": d.raw_text,
            },
            lambda d, i: f"{d.document_type}_{i}",
            changed,
            unchanged,
            superseded,
        )
        self._evolve_simple_collection(
            mock,
            ruleset,
            scheme_id,
            timestamp_now,
            "benefits",
            "benefit",
            "HAS_BENEFIT",
            lambda b, i: {
                "benefit_type": b.benefit_type,
                "amount": b.amount,
                "frequency": b.frequency,
                "raw_text": b.raw_text,
            },
            lambda b, i: f"{b.benefit_type}_{i}",
            changed,
            unchanged,
            superseded,
        )

        active_exclusions = self._active_nodes(mock, scheme_id, "HAS_EXCLUSION")
        active_exc_by_field = {n.get("field"): n for n in active_exclusions if n.get("field")}
        for idx, exc in enumerate(ruleset.exclusions, start=1):
            incoming = {
                "field": exc.field,
                "operator": exc.operator,
                "value": exc.value,
                "unit": exc.unit,
                "raw_text": exc.raw_text,
            }
            current = active_exc_by_field.get(exc.field)
            if current and _clause_signature("exclusion", current) == _clause_signature(
                "exclusion", incoming
            ):
                unchanged.append(f"exclusion:{exc.field}")
                continue

            if current:
                current_id = current["id"]
                mock.nodes[current_id]["valid_to"] = timestamp_now
                mock.nodes[current_id]["is_current"] = False
                superseded.append(current_id)
                self._remove_scheme_edge(mock, scheme_id, "HAS_EXCLUSION", current_id)

            eid = ExtractedRuleSetInput.generate_clause_id(
                scheme_id, "exclusion", f"{exc.field}_{idx}", ruleset.version
            )
            mock.merge_node(
                "Exclusion",
                eid,
                {
                    "scheme_id": scheme_id,
                    "field": exc.field,
                    "operator": exc.operator,
                    "value": exc.value,
                    "unit": exc.unit,
                    "raw_text": exc.raw_text,
                    "version": ruleset.version,
                    "valid_from": timestamp_now,
                    "valid_to": None,
                    "is_current": True,
                },
            )
            mock.merge_relationship(scheme_id, "HAS_EXCLUSION", eid)
            if current:
                mock.merge_relationship(current_id, "AMENDED_BY", eid)
            for cid in condition_id_map.values():
                cond_node = mock.nodes.get(cid, {})
                if cond_node.get("field") == exc.field:
                    mock.merge_relationship(eid, "OVERRIDES", cid)
            changed.append(f"exclusion:{exc.field}")

        return {
            "scheme_id": scheme_id,
            "version": ruleset.version,
            "changed_clauses": changed,
            "unchanged_clauses": unchanged,
            "superseded_node_ids": superseded,
            "status": "evolved",
        }

    def _evolve_simple_collection(
        self,
        mock: MockGraphClient,
        ruleset: ExtractedRuleSetInput,
        scheme_id: str,
        timestamp_now: str,
        collection_attr: str,
        clause_type: str,
        rel_type: str,
        payload_fn,
        key_fn,
        changed: List[str],
        unchanged: List[str],
        superseded: List[str],
    ) -> None:
        items = getattr(ruleset, collection_attr)
        active = self._active_nodes(mock, scheme_id, rel_type)
        active_by_key: Dict[str, Dict[str, Any]] = {}
        for n in active:
            if clause_type == "document":
                k = f"{n.get('document_type')}"
            elif clause_type == "benefit":
                k = f"{n.get('benefit_type')}_{n.get('amount')}_{n.get('frequency')}"
            else:
                k = n.get("id", "")
            active_by_key[k] = n

        for idx, item in enumerate(items, start=1):
            incoming = payload_fn(item, idx)
            key = key_fn(item, idx)
            sig = _clause_signature(clause_type, incoming)
            matched = None
            for n in active:
                if _clause_signature(clause_type, n) == sig:
                    matched = n
                    break
            if matched:
                unchanged.append(f"{clause_type}:{key}")
                continue

            if clause_type == "document":
                lookup_key = item.document_type
            elif clause_type == "benefit":
                lookup_key = f"{item.benefit_type}_{item.amount}_{item.frequency}"
            else:
                lookup_key = key

            stale = active_by_key.get(lookup_key) if clause_type == "document" else None
            if stale is None and clause_type == "benefit":
                for n in active:
                    if n.get("benefit_type") == item.benefit_type:
                        stale = n
                        break

            node_id = ExtractedRuleSetInput.generate_clause_id(
                scheme_id, clause_type, key, ruleset.version
            )
            props = dict(incoming)
            props.update(
                {
                    "scheme_id": scheme_id,
                    "version": ruleset.version,
                    "valid_from": timestamp_now,
                    "valid_to": None,
                    "is_current": True,
                }
            )
            label = clause_type.capitalize()
            if label == "Document":
                label = "Document"
            elif label == "Benefit":
                label = "Benefit"

            if stale:
                stale_id = stale["id"]
                mock.nodes[stale_id]["valid_to"] = timestamp_now
                mock.nodes[stale_id]["is_current"] = False
                superseded.append(stale_id)
                self._remove_scheme_edge(mock, scheme_id, rel_type, stale_id)
                mock.merge_relationship(stale_id, "AMENDED_BY", node_id)

            mock.merge_node(label, node_id, props)
            mock.merge_relationship(scheme_id, rel_type, node_id)
            changed.append(f"{clause_type}:{key}")

    @staticmethod
    def _active_nodes(
        mock: MockGraphClient, scheme_id: str, rel_type: str
    ) -> List[Dict[str, Any]]:
        nodes: List[Dict[str, Any]] = []
        for rel in mock.relationships:
            if rel["from_id"] == scheme_id and rel["rel_type"] == rel_type:
                node = mock.nodes.get(rel["to_id"])
                if node and node.get("valid_to") in (None, ""):
                    nodes.append(node)
        return nodes

    @staticmethod
    def _remove_scheme_edge(
        mock: MockGraphClient, scheme_id: str, rel_type: str, target_id: str
    ) -> None:
        mock.relationships = [
            r
            for r in mock.relationships
            if not (
                r["from_id"] == scheme_id
                and r["rel_type"] == rel_type
                and r["to_id"] == target_id
            )
        ]

    def _evolve_neo4j(self, ruleset: ExtractedRuleSetInput) -> Dict[str, Any]:
        scheme_id = ruleset.notification_id
        timestamp_now = datetime.now(timezone.utc).isoformat()
        changed: List[str] = []
        unchanged: List[str] = []
        superseded: List[str] = []

        # Check existing scheme
        check_q = "MATCH (s:Scheme {id: $scheme_id}) RETURN s"
        res = self.client.execute_query(check_q, {"scheme_id": scheme_id})
        if not res:
            from app.graph_builder import GraphBuilder
            return GraphBuilder(client=self.client).ingest_ruleset(ruleset)

        # Update scheme node version
        upd_scheme_q = """
        MATCH (s:Scheme {id: $scheme_id})
        SET s.version = $version, s.source_language = $lang
        """
        self.client.execute_write(upd_scheme_q, {
            "scheme_id": scheme_id,
            "version": ruleset.version,
            "lang": ruleset.source_language,
        })

        # Process conditions
        active_conds_q = """
        MATCH (s:Scheme {id: $scheme_id})-[:HAS_CONDITION]->(c:Condition)
        WHERE c.is_current = true OR c.valid_to IS NULL
        RETURN c
        """
        active_conds = [r["c"] for r in self.client.execute_query(active_conds_q, {"scheme_id": scheme_id})]
        active_by_field = {c.get("field"): c for c in active_conds if c.get("field")}

        condition_id_map: Dict[str, str] = {}
        for cond in ruleset.conditions:
            field = cond.field
            incoming = {
                "field": cond.field,
                "operator": cond.operator,
                "value": cond.value,
                "unit": cond.unit,
                "depends_on_field": cond.depends_on_field,
                "raw_text": cond.raw_text,
            }
            current = active_by_field.get(field)
            if current and _clause_signature("condition", current) == _clause_signature("condition", incoming):
                condition_id_map[field] = current["id"]
                unchanged.append(f"condition:{field}")
                continue

            if current:
                current_id = current["id"]
                supersede_q = """
                MATCH (c:Condition {id: $id})
                SET c.valid_to = $now, c.is_current = false
                """
                self.client.execute_write(supersede_q, {"id": current_id, "now": timestamp_now})
                superseded.append(current_id)

            cid = ExtractedRuleSetInput.generate_clause_id(
                scheme_id, "condition", field, ruleset.version
            )
            condition_id_map[field] = cid
            create_cond_q = """
            MATCH (s:Scheme {id: $scheme_id})
            MERGE (c:Condition {id: $cid})
            SET c.scheme_id = $scheme_id,
                c.field = $field,
                c.operator = $operator,
                c.value = $value,
                c.unit = $unit,
                c.raw_text = $raw_text,
                c.version = $version,
                c.valid_from = $now,
                c.valid_to = null,
                c.is_current = true,
                c.depends_on_field = $depends_on
            MERGE (s)-[:HAS_CONDITION]->(c)
            """
            self.client.execute_write(create_cond_q, {
                "scheme_id": scheme_id,
                "cid": cid,
                "field": cond.field,
                "operator": cond.operator,
                "value": cond.value,
                "unit": cond.unit,
                "raw_text": cond.raw_text,
                "version": ruleset.version,
                "now": timestamp_now,
                "depends_on": cond.depends_on_field,
            })

            if current:
                amend_q = """
                MATCH (old:Condition {id: $old_id}), (new:Condition {id: $new_id})
                MERGE (old)-[:AMENDED_BY]->(new)
                """
                self.client.execute_write(amend_q, {"old_id": current["id"], "new_id": cid})

            changed.append(f"condition:{field}")

        return {
            "scheme_id": scheme_id,
            "version": ruleset.version,
            "changed_clauses": changed,
            "unchanged_clauses": unchanged,
            "superseded_node_ids": superseded,
            "status": "evolved_neo4j",
        }
