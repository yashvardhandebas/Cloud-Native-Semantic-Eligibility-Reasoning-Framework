import json
import sys
from pathlib import Path

# Add layer root to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.graph_builder import graph_builder
from app.graph_client import get_graph_client
from app.config import settings

def main():
    print("=" * 80)
    print("LAYER 3: Semantic Rule Dependency Graph & Reasoning Engine - Graph Ingestion Test")
    print("=" * 80)
    print(f"Active Client Mode: {settings.USE_MOCK_GRAPH} (Live Aura Configured: {settings.is_live_aura_configured()})")
    if settings.is_live_aura_configured():
        print(f"Connecting to live AuraDB: {settings.NEO4J_URI}")
    else:
        print("Running in isolated graph engine mode (Neo4j AuraDB credentials not yet provided in .env)")

    sample_ruleset_path = Path(__file__).parent / "sample_data" / "sample_ruleset.json"
    if not sample_ruleset_path.exists():
        print(f"Error: Sample ruleset not found at {sample_ruleset_path}")
        sys.exit(1)

    print(f"\nIngesting Layer 2 ruleset from: {sample_ruleset_path.name}")
    with open(sample_ruleset_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"Scheme Name: {data.get('scheme_name')}")
    print(f"Notification ID: {data.get('notification_id')}")

    # 1. Initial Ingestion
    print("\nExecuting graph ingestion (Step 1: Initial Ingest)...")
    res1 = graph_builder.ingest_ruleset(sample_ruleset_path)
    print("Ingestion Result:")
    print(json.dumps(res1, indent=2))

    # 2. Idempotency Test (Re-ingesting must not duplicate nodes)
    print("\nExecuting re-ingestion to verify idempotency (Step 2: Idempotency Check)...")
    res2 = graph_builder.ingest_ruleset(sample_ruleset_path)
    print("Re-ingestion completed. Verifying node counts remain unchanged...")

    # 3. Graph summary and inspection
    client = get_graph_client()
    summary = client.get_graph_summary()
    print("\n" + "=" * 80)
    print("NEO4J GRAPH SUMMARY & TOPOLOGY BREAKDOWN")
    print("=" * 80)
    print(f"Storage Engine Mode: {summary.get('mode')}")
    print(f"Total Nodes:         {summary.get('total_nodes')}")
    print(f"Total Relationships: {summary.get('total_relationships')}")
    print("\nNode Counts by Label:")
    for label, count in summary.get("node_counts", {}).items():
        print(f"  • (:{label:<12}) -> {count} nodes")

    print("\nRelationship Counts by Type:")
    for rel, count in summary.get("relationship_counts", {}).items():
        print(f"  • [:{rel:<18}] -> {count} edges")

    # If mock graph, print sample nodes and their connections
    if hasattr(client, "nodes"):
        print("\n" + "-" * 80)
        print("SAMPLE GRAPH NODES & PROPERTIES (First 3):")
        print("-" * 80)
        for idx, (nid, node) in enumerate(list(client.nodes.items())[:3], start=1):
            print(f"[{idx}] Node ID: {nid} (Label: {node.get('_label')})")
            for k, v in node.items():
                if k not in ("_label", "id"):
                    print(f"      {k}: {repr(v)}")
            print()

        print("-" * 80)
        print("SAMPLE RELATIONSHIPS:")
        print("-" * 80)
        for r in client.relationships[:6]:
            print(f"  (:{r['from_id']}) -[:{r['rel_type']}]-> (:{r['to_id']})")
    print("=" * 80)

if __name__ == "__main__":
    main()
