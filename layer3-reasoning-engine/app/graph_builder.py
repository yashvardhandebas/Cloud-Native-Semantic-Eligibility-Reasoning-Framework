import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from app.graph_client import BaseGraphClient, MockGraphClient, Neo4jAuraClient, get_graph_client
from app.schema import ExtractedRuleSetInput

logger = logging.getLogger(__name__)


class GraphBuilder:
    """
    Ingests structured rulesets from Layer 2 into the Neo4j knowledge graph.
    All operations use idempotent MERGE patterns to prevent duplicate nodes.
    """

    def __init__(self, client: Optional[BaseGraphClient] = None):
        self.client = client or get_graph_client()

    def ingest_ruleset(
        self, ruleset_data: Union[Dict[str, Any], ExtractedRuleSetInput, str, Path]
    ) -> Dict[str, Any]:
        """
        Parse ruleset data and build Scheme, Condition, Document, Benefit,
        and Exclusion nodes along with all relational edges.
        """
        if isinstance(ruleset_data, (str, Path)):
            path = Path(ruleset_data)
            if path.is_file():
                with open(path, "r", encoding="utf-8") as f:
                    ruleset_dict = json.load(f)
            else:
                ruleset_dict = json.loads(str(ruleset_data))
            ruleset = ExtractedRuleSetInput.model_validate(ruleset_dict)
        elif isinstance(ruleset_data, dict):
            ruleset = ExtractedRuleSetInput.model_validate(ruleset_data)
        elif isinstance(ruleset_data, ExtractedRuleSetInput):
            ruleset = ruleset_data
        else:
            raise ValueError(f"Unsupported ruleset input type: {type(ruleset_data)}")

        scheme_id = ruleset.notification_id
        scheme_name = ruleset.scheme_name or scheme_id
        timestamp_now = datetime.now(timezone.utc).isoformat()
        version = ruleset.version

        logger.info(f"Ingesting scheme '{scheme_name}' (ID: {scheme_id}, v{version}) into graph...")

        if isinstance(self.client, Neo4jAuraClient):
            return self._ingest_neo4j(ruleset, timestamp_now)
        elif isinstance(self.client, MockGraphClient):
            return self._ingest_mock(ruleset, timestamp_now)
        else:
            # Fallback using standard Cypher if it's another BaseGraphClient
            return self._ingest_neo4j(ruleset, timestamp_now)

    def _ingest_neo4j(self, ruleset: ExtractedRuleSetInput, timestamp_now: str) -> Dict[str, Any]:
        """Ingest using Cypher MERGE queries over Neo4j AuraDB."""
        scheme_id = ruleset.notification_id
        version = ruleset.version

        # 1. Merge Scheme Node
        merge_scheme_query = """
        MERGE (s:Scheme {id: $scheme_id})
        ON CREATE SET s.name = $scheme_name,
                      s.source_language = $source_language,
                      s.version = $version,
                      s.valid_from = $valid_from,
                      s.valid_to = null
        ON MATCH SET s.name = $scheme_name,
                     s.source_language = $source_language,
                     s.version = $version
        """
        self.client.execute_write(
            merge_scheme_query,
            {
                "scheme_id": scheme_id,
                "scheme_name": ruleset.scheme_name or scheme_id,
                "source_language": ruleset.source_language,
                "version": version,
                "valid_from": timestamp_now,
            },
        )

        condition_nodes_created = 0
        document_nodes_created = 0
        benefit_nodes_created = 0
        exclusion_nodes_created = 0
        relationships_created = 0

        # 2. Merge Condition Nodes & (Scheme)-[:HAS_CONDITION]->(Condition)
        condition_id_map: Dict[str, str] = {}
        for cond in ruleset.conditions:
            cid = ExtractedRuleSetInput.generate_clause_id(scheme_id, "condition", cond.field, version)
            condition_id_map[cond.field] = cid

            q = """
            MATCH (s:Scheme {id: $scheme_id})
            MERGE (c:Condition {id: $cid})
            ON CREATE SET c.scheme_id = $scheme_id,
                          c.field = $field,
                          c.operator = $operator,
                          c.value = $value,
                          c.unit = $unit,
                          c.raw_text = $raw_text,
                          c.version = $version,
                          c.valid_from = $valid_from,
                          c.valid_to = null
            ON MATCH SET c.operator = $operator,
                         c.value = $value,
                         c.unit = $unit,
                         c.raw_text = $raw_text
            MERGE (s)-[:HAS_CONDITION]->(c)
            """
            self.client.execute_write(
                q,
                {
                    "scheme_id": scheme_id,
                    "cid": cid,
                    "field": cond.field,
                    "operator": cond.operator,
                    "value": str(cond.value),
                    "unit": cond.unit,
                    "raw_text": cond.raw_text,
                    "version": version,
                    "valid_from": timestamp_now,
                },
            )
            condition_nodes_created += 1
            relationships_created += 1

        # 2b. Merge DEPENDS_ON relationships between conditions
        for cond in ruleset.conditions:
            if cond.depends_on_field and cond.depends_on_field in condition_id_map:
                dep_q = """
                MATCH (c1:Condition {id: $cid1}), (c2:Condition {id: $cid2})
                MERGE (c1)-[:DEPENDS_ON]->(c2)
                """
                self.client.execute_write(
                    dep_q,
                    {
                        "cid1": condition_id_map[cond.field],
                        "cid2": condition_id_map[cond.depends_on_field],
                    },
                )
                relationships_created += 1

        # 3. Merge Document Nodes & (Condition)-[:REQUIRES_DOCUMENT]->(Document)
        for idx, doc in enumerate(ruleset.documents, start=1):
            did = ExtractedRuleSetInput.generate_clause_id(
                scheme_id, "document", f"{doc.document_type}_{idx}", version
            )
            q = """
            MATCH (s:Scheme {id: $scheme_id})
            MERGE (d:Document {id: $did})
            ON CREATE SET d.scheme_id = $scheme_id,
                          d.document_type = $document_type,
                          d.required_for = $required_for,
                          d.raw_text = $raw_text,
                          d.version = $version,
                          d.valid_from = $valid_from,
                          d.valid_to = null
            ON MATCH SET d.document_type = $document_type,
                         d.required_for = $required_for,
                         d.raw_text = $raw_text
            MERGE (s)-[:HAS_DOCUMENT]->(d)
            """
            self.client.execute_write(
                q,
                {
                    "scheme_id": scheme_id,
                    "did": did,
                    "document_type": doc.document_type,
                    "required_for": doc.required_for,
                    "raw_text": doc.raw_text,
                    "version": version,
                    "valid_from": timestamp_now,
                },
            )
            document_nodes_created += 1
            relationships_created += 1

            # Connect document to matching condition if applicable
            for cond in ruleset.conditions:
                if (
                    cond.field in doc.required_for.lower()
                    or doc.document_type in cond.field
                    or "caste" in doc.document_type and "caste" in cond.field
                    or "income" in doc.document_type and "income" in cond.field
                ):
                    cid = condition_id_map.get(cond.field)
                    if cid:
                        link_q = """
                        MATCH (c:Condition {id: $cid}), (d:Document {id: $did})
                        MERGE (c)-[:REQUIRES_DOCUMENT]->(d)
                        """
                        self.client.execute_write(link_q, {"cid": cid, "did": did})
                        relationships_created += 1

        # 4. Merge Benefit Nodes & (Scheme)-[:HAS_BENEFIT]->(Benefit)
        for idx, bnf in enumerate(ruleset.benefits, start=1):
            bid = ExtractedRuleSetInput.generate_clause_id(
                scheme_id, "benefit", f"{bnf.benefit_type}_{idx}", version
            )
            q = """
            MATCH (s:Scheme {id: $scheme_id})
            MERGE (b:Benefit {id: $bid})
            ON CREATE SET b.scheme_id = $scheme_id,
                          b.benefit_type = $benefit_type,
                          b.amount = $amount,
                          b.frequency = $frequency,
                          b.raw_text = $raw_text,
                          b.version = $version,
                          b.valid_from = $valid_from,
                          b.valid_to = null
            ON MATCH SET b.benefit_type = $benefit_type,
                         b.amount = $amount,
                         b.frequency = $frequency,
                         b.raw_text = $raw_text
            MERGE (s)-[:HAS_BENEFIT]->(b)
            """
            self.client.execute_write(
                q,
                {
                    "scheme_id": scheme_id,
                    "bid": bid,
                    "benefit_type": bnf.benefit_type,
                    "amount": str(bnf.amount) if bnf.amount is not None else None,
                    "frequency": bnf.frequency,
                    "raw_text": bnf.raw_text,
                    "version": version,
                    "valid_from": timestamp_now,
                },
            )
            benefit_nodes_created += 1
            relationships_created += 1

        # 5. Merge Exclusion Nodes & (Scheme)-[:HAS_EXCLUSION]->(Exclusion)
        for idx, exc in enumerate(ruleset.exclusions, start=1):
            eid = ExtractedRuleSetInput.generate_clause_id(
                scheme_id, "exclusion", f"{exc.field}_{idx}", version
            )
            q = """
            MATCH (s:Scheme {id: $scheme_id})
            MERGE (e:Exclusion {id: $eid})
            ON CREATE SET e.scheme_id = $scheme_id,
                          e.field = $field,
                          e.operator = $operator,
                          e.value = $value,
                          e.unit = $unit,
                          e.raw_text = $raw_text,
                          e.version = $version,
                          e.valid_from = $valid_from,
                          e.valid_to = null
            ON MATCH SET e.field = $field,
                         e.operator = $operator,
                         e.value = $value,
                         e.unit = $unit,
                         e.raw_text = $raw_text
            MERGE (s)-[:HAS_EXCLUSION]->(e)
            """
            self.client.execute_write(
                q,
                {
                    "scheme_id": scheme_id,
                    "eid": eid,
                    "field": exc.field,
                    "operator": exc.operator,
                    "value": str(exc.value),
                    "unit": exc.unit,
                    "raw_text": exc.raw_text,
                    "version": version,
                    "valid_from": timestamp_now,
                },
            )
            exclusion_nodes_created += 1
            relationships_created += 1

            # (Exclusion)-[:OVERRIDES]->(Condition)
            # Link exclusion to condition when exclusion field matches condition field
            for cond in ruleset.conditions:
                if cond.field == exc.field:
                    cid = condition_id_map.get(cond.field)
                    if cid:
                        override_q = """
                        MATCH (e:Exclusion {id: $eid}), (c:Condition {id: $cid})
                        MERGE (e)-[:OVERRIDES]->(c)
                        """
                        self.client.execute_write(override_q, {"eid": eid, "cid": cid})
                        relationships_created += 1

        return {
            "scheme_id": scheme_id,
            "scheme_name": ruleset.scheme_name,
            "version": version,
            "nodes_ingested": {
                "Scheme": 1,
                "Condition": condition_nodes_created,
                "Document": document_nodes_created,
                "Benefit": benefit_nodes_created,
                "Exclusion": exclusion_nodes_created,
                "Total": 1 + condition_nodes_created + document_nodes_created + benefit_nodes_created + exclusion_nodes_created,
            },
            "relationships_created": relationships_created,
            "status": "success",
        }

    def _ingest_mock(self, ruleset: ExtractedRuleSetInput, timestamp_now: str) -> Dict[str, Any]:
        """Ingest using MockGraphClient for testing and offline development."""
        mock = self.client
        assert isinstance(mock, MockGraphClient)

        scheme_id = ruleset.notification_id
        version = ruleset.version

        # Merge Scheme
        mock.merge_node(
            "Scheme",
            scheme_id,
            {
                "name": ruleset.scheme_name or scheme_id,
                "source_language": ruleset.source_language,
                "version": version,
                "valid_from": timestamp_now,
                "valid_to": None,
            },
        )

        condition_id_map: Dict[str, str] = {}
        for cond in ruleset.conditions:
            cid = ExtractedRuleSetInput.generate_clause_id(scheme_id, "condition", cond.field, version)
            condition_id_map[cond.field] = cid
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
                    "depends_on_field": cond.depends_on_field,
                    "version": version,
                    "valid_from": timestamp_now,
                    "valid_to": None,
                    "is_current": True,
                },
            )
            mock.merge_relationship(scheme_id, "HAS_CONDITION", cid)

        # Depends on
        for cond in ruleset.conditions:
            if cond.depends_on_field and cond.depends_on_field in condition_id_map:
                mock.merge_relationship(
                    condition_id_map[cond.field], "DEPENDS_ON", condition_id_map[cond.depends_on_field]
                )

        # Documents
        for idx, doc in enumerate(ruleset.documents, start=1):
            did = ExtractedRuleSetInput.generate_clause_id(
                scheme_id, "document", f"{doc.document_type}_{idx}", version
            )
            mock.merge_node(
                "Document",
                did,
                {
                    "scheme_id": scheme_id,
                    "document_type": doc.document_type,
                    "required_for": doc.required_for,
                    "raw_text": doc.raw_text,
                    "version": version,
                    "valid_from": timestamp_now,
                    "valid_to": None,
                },
            )
            mock.merge_relationship(scheme_id, "HAS_DOCUMENT", did)

            for cond in ruleset.conditions:
                if (
                    cond.field in doc.required_for.lower()
                    or doc.document_type in cond.field
                    or "caste" in doc.document_type and "caste" in cond.field
                    or "income" in doc.document_type and "income" in cond.field
                ):
                    cid = condition_id_map.get(cond.field)
                    if cid:
                        mock.merge_relationship(cid, "REQUIRES_DOCUMENT", did)

        # Benefits
        for idx, bnf in enumerate(ruleset.benefits, start=1):
            bid = ExtractedRuleSetInput.generate_clause_id(
                scheme_id, "benefit", f"{bnf.benefit_type}_{idx}", version
            )
            mock.merge_node(
                "Benefit",
                bid,
                {
                    "scheme_id": scheme_id,
                    "benefit_type": bnf.benefit_type,
                    "amount": bnf.amount,
                    "frequency": bnf.frequency,
                    "raw_text": bnf.raw_text,
                    "version": version,
                    "valid_from": timestamp_now,
                    "valid_to": None,
                },
            )
            mock.merge_relationship(scheme_id, "HAS_BENEFIT", bid)

        # Exclusions
        for idx, exc in enumerate(ruleset.exclusions, start=1):
            eid = ExtractedRuleSetInput.generate_clause_id(
                scheme_id, "exclusion", f"{exc.field}_{idx}", version
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
                    "version": version,
                    "valid_from": timestamp_now,
                    "valid_to": None,
                },
            )
            mock.merge_relationship(scheme_id, "HAS_EXCLUSION", eid)

            for cond in ruleset.conditions:
                if cond.field == exc.field:
                    cid = condition_id_map.get(cond.field)
                    if cid:
                        mock.merge_relationship(eid, "OVERRIDES", cid)

        summary = mock.get_graph_summary()
        return {
            "scheme_id": scheme_id,
            "scheme_name": ruleset.scheme_name,
            "version": version,
            "nodes_ingested": summary["node_counts"],
            "total_nodes": summary["total_nodes"],
            "relationships_created": summary["total_relationships"],
            "relationship_breakdown": summary["relationship_counts"],
            "status": "success",
        }


# Global default builder
graph_builder = GraphBuilder()
