import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from neo4j import GraphDatabase, Driver, Session

from app.config import settings

logger = logging.getLogger(__name__)


class BaseGraphClient(ABC):
    """Abstract interface for graph database interactions."""

    @abstractmethod
    def execute_query(
        self, query: str, parameters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Execute a read/write Cypher query and return list of record dicts."""
        pass

    @abstractmethod
    def execute_write(
        self, query: str, parameters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Execute a write transaction."""
        pass

    @abstractmethod
    def verify_connectivity(self) -> bool:
        """Verify graph database connectivity."""
        pass

    @abstractmethod
    def get_graph_summary(self) -> Dict[str, Any]:
        """Return node and relationship counts summary."""
        pass

    @abstractmethod
    def close(self) -> None:
        """Close driver connections."""
        pass


class Neo4jAuraClient(BaseGraphClient):
    """Live Neo4j AuraDB client using the official neo4j Python driver."""

    def __init__(
        self,
        uri: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
        database: Optional[str] = None,
    ):
        self.uri = uri or settings.NEO4J_URI
        self.user = user or settings.NEO4J_USER
        self.password = password or settings.NEO4J_PASSWORD
        self.database = database or settings.NEO4J_DATABASE
        self._driver: Optional[Driver] = None

    @property
    def driver(self) -> Driver:
        """Lazy-initialize Neo4j driver connection."""
        if self._driver is None:
            logger.info(f"Connecting to Neo4j AuraDB at {self.uri}")
            self._driver = GraphDatabase.driver(
                self.uri,
                auth=(self.user, self.password),
                connection_timeout=settings.NEO4J_CONNECTION_TIMEOUT,
            )
        return self._driver

    def verify_connectivity(self) -> bool:
        """Check if AuraDB instance is reachable and authenticated."""
        try:
            self.driver.verify_connectivity()
            return True
        except Exception as e:
            logger.warning(f"Neo4j AuraDB connectivity check failed: {e}")
            return False

    def execute_query(
        self, query: str, parameters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Execute Cypher query and return list of records as dicts."""
        params = parameters or {}
        with self.driver.session(database=self.database) as session:
            result = session.run(query, params)
            return [record.data() for record in result]

    def execute_write(
        self, query: str, parameters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Execute Cypher write transaction."""
        return self.execute_query(query, parameters)

    def init_constraints(self) -> None:
        """Create uniqueness constraints on node IDs."""
        constraints = [
            "CREATE CONSTRAINT IF NOT EXISTS FOR (s:Scheme) REQUIRE s.id IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (c:Condition) REQUIRE c.id IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (d:Document) REQUIRE d.id IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (b:Benefit) REQUIRE b.id IS UNIQUE",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (e:Exclusion) REQUIRE e.id IS UNIQUE",
        ]
        for c in constraints:
            try:
                self.execute_write(c)
            except Exception as e:
                logger.debug(f"Constraint creation note: {e}")

    def get_graph_summary(self) -> Dict[str, Any]:
        """Query total node counts by label and relationship counts by type."""
        node_counts = {}
        labels = ["Scheme", "Condition", "Document", "Benefit", "Exclusion"]
        for label in labels:
            q = f"MATCH (n:{label}) RETURN count(n) AS count"
            res = self.execute_query(q)
            node_counts[label] = res[0]["count"] if res else 0

        rel_counts = {}
        rel_q = "MATCH ()-[r]->() RETURN type(r) AS rel_type, count(r) AS count"
        rel_res = self.execute_query(rel_q)
        for row in rel_res:
            rel_counts[row["rel_type"]] = row["count"]

        return {
            "mode": "live_neo4j_auradb",
            "uri": self.uri,
            "node_counts": node_counts,
            "total_nodes": sum(node_counts.values()),
            "relationship_counts": rel_counts,
            "total_relationships": sum(rel_counts.values()),
        }

    def close(self) -> None:
        if self._driver:
            self._driver.close()
            self._driver = None


class MockGraphClient(BaseGraphClient):
    """
    In-memory graph client for offline development, local unit testing,
    and fallback when live Neo4j AuraDB credentials are not yet configured.
    Implements the same semantics for nodes, relationships, and queries.
    """

    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.relationships: List[Dict[str, Any]] = []

    def verify_connectivity(self) -> bool:
        return True

    def execute_query(
        self, query: str, parameters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        # Used by reasoning engine and graph builder inspection
        params = parameters or {}
        scheme_id = params.get("scheme_id")

        if "RETURN labels(n)" in query or "count(n)" in query:
            summary = self.get_graph_summary()
            return [{"summary": summary}]

        if scheme_id:
            # Return nodes connected to this scheme
            results = []
            scheme_node = self.nodes.get(scheme_id)
            if scheme_node:
                results.append({"scheme": scheme_node})
            return results

        return []

    def execute_write(
        self, query: str, parameters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        return []

    def merge_node(self, label: str, node_id: str, properties: Dict[str, Any]) -> Dict[str, Any]:
        """Merge a node with given label and properties into the in-memory graph."""
        if node_id not in self.nodes:
            props = dict(properties)
            props["id"] = node_id
            props["_label"] = label
            self.nodes[node_id] = props
        else:
            self.nodes[node_id].update(properties)
        return self.nodes[node_id]

    def merge_relationship(
        self, from_id: str, rel_type: str, to_id: str, properties: Optional[Dict[str, Any]] = None
    ) -> None:
        """Merge a directed relationship between two nodes."""
        for rel in self.relationships:
            if rel["from_id"] == from_id and rel["rel_type"] == rel_type and rel["to_id"] == to_id:
                if properties:
                    rel["properties"].update(properties)
                return

        self.relationships.append({
            "from_id": from_id,
            "rel_type": rel_type,
            "to_id": to_id,
            "properties": dict(properties or {}),
        })

    def get_scheme_subgraph(self, scheme_id: str) -> Dict[str, Any]:
        """Fetch full subgraph for a given scheme."""
        scheme_node = self.nodes.get(scheme_id)
        if not scheme_node:
            return {}

        conditions = []
        documents = []
        benefits = []
        exclusions = []
        depends_on = []
        overrides = []
        requires_doc = []

        for rel in self.relationships:
            if rel["from_id"] == scheme_id:
                target = self.nodes.get(rel["to_id"], {})
                if rel["rel_type"] == "HAS_CONDITION":
                    conditions.append(target)
                elif rel["rel_type"] == "HAS_DOCUMENT":
                    documents.append(target)
                elif rel["rel_type"] == "HAS_BENEFIT":
                    benefits.append(target)
                elif rel["rel_type"] == "HAS_EXCLUSION":
                    exclusions.append(target)
            elif rel["rel_type"] == "REQUIRES_DOCUMENT":
                requires_doc.append(rel)
            elif rel["rel_type"] == "DEPENDS_ON":
                depends_on.append(rel)
            elif rel["rel_type"] == "OVERRIDES":
                overrides.append(rel)

        return {
            "scheme": scheme_node,
            "conditions": conditions,
            "documents": documents,
            "benefits": benefits,
            "exclusions": exclusions,
            "depends_on": depends_on,
            "overrides": overrides,
            "requires_doc": requires_doc,
        }

    def get_graph_summary(self) -> Dict[str, Any]:
        """Count nodes by label and relationships by type."""
        node_counts: Dict[str, int] = {}
        for n in self.nodes.values():
            lbl = n.get("_label", "Unknown")
            node_counts[lbl] = node_counts.get(lbl, 0) + 1

        rel_counts: Dict[str, int] = {}
        for r in self.relationships:
            t = r["rel_type"]
            rel_counts[t] = rel_counts.get(t, 0) + 1

        return {
            "mode": "in_memory_mock_graph",
            "node_counts": node_counts,
            "total_nodes": len(self.nodes),
            "relationship_counts": rel_counts,
            "total_relationships": len(self.relationships),
        }

    def close(self) -> None:
        pass


def get_graph_client() -> BaseGraphClient:
    """
    Factory function returning the active graph client.
    Connects to live Neo4j AuraDB if configured, otherwise uses the in-memory mock.
    """
    if settings.is_live_aura_configured():
        try:
            client = Neo4jAuraClient()
            if client.verify_connectivity():
                client.init_constraints()
                return client
            logger.warning("AuraDB connectivity check failed, falling back to mock graph client.")
        except Exception as e:
            logger.warning(f"Could not connect to AuraDB ({e}), using mock graph client.")

    return _mock_client_singleton


# Singleton instance of mock client for application lifetime
_mock_client_singleton = MockGraphClient()
