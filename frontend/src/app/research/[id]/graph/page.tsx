"use client"

import { use, useEffect, useState } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { getClaims, getEvidence, getSources } from "@/lib/api"
import type { Claim, Evidence, Source } from "@/types"

function ClaimNode({ data }: NodeProps) {
  return (
    <div className="glass-sm px-4 py-2 max-w-64 text-sm">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <p className="font-medium text-xs text-muted-foreground mb-1">Claim</p>
      <p className="leading-snug">{data.label as string}</p>
    </div>
  )
}

function EvidenceNode({ data }: NodeProps) {
  return (
    <div className="glass-sm px-4 py-2 max-w-56 text-sm">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <p className="font-medium text-xs text-muted-foreground mb-1">Evidence</p>
      <p className="text-xs leading-snug line-clamp-3">{data.label as string}</p>
    </div>
  )
}

function SourceNode({ data }: NodeProps) {
  return (
    <div className="glass-sm px-4 py-2 max-w-48 text-sm">
      <Handle type="target" position={Position.Top} />
      <p className="font-medium text-xs text-muted-foreground mb-1">Source</p>
      <p className="text-xs truncate">{data.label as string}</p>
    </div>
  )
}

const nodeTypes = {
  claim: ClaimNode,
  evidence: EvidenceNode,
  source: SourceNode,
}

type FlowNode = Node<{ label: string }, "claim" | "evidence" | "source">

export default function GraphPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selected, setSelected] = useState<{ type: string; data: unknown } | null>(null)

  useEffect(() => {
    async function load() {
      const [claims, evidence, sources] = await Promise.all([
        getClaims(id),
        getEvidence(id),
        getSources(id),
      ])

      const claimNodes: FlowNode[] = (claims as Claim[]).map((c, i) => ({
        id: c.id,
        type: "claim",
        position: { x: 300, y: i * 140 },
        data: { label: c.claim.length > 80 ? c.claim.slice(0, 80) + "..." : c.claim },
      }))

      const evidenceNodes: FlowNode[] = ((evidence as Evidence[]) || []).map((e, i) => ({
        id: e.id,
        type: "evidence",
        position: { x: 600, y: i * 100 },
        data: { label: e.passage.length > 100 ? e.passage.slice(0, 100) + "..." : e.passage },
      }))

      const sourceMap = new Map((sources as Source[]).map((s) => [s.id, s]))
      const sourceNodes: FlowNode[] = ((sources as Source[]) || []).map((s, i) => ({
        id: s.id,
        type: "source",
        position: { x: 900, y: i * 80 },
        data: { label: s.title || s.domain || s.url },
      }))

      const edgesList: Edge[] = []

      for (const e of evidence as Evidence[]) {
        edgesList.push({
          id: `ce-${e.id}`,
          source: e.claim_id,
          target: e.id,
          type: "smoothstep",
        })
        if (e.source_id) {
          edgesList.push({
            id: `es-${e.id}`,
            source: e.id,
            target: e.source_id,
            type: "smoothstep",
            style: { opacity: 0.5 },
          })
        }
      }

      setNodes([...claimNodes, ...evidenceNodes, ...sourceNodes])
      setEdges(edgesList)
    }
    load()
  }, [id, setNodes, setEdges])

  const onNodeClick = (_: React.MouseEvent, node: FlowNode) => {
    setSelected({ type: node.type || "", data: node.data })
  }

  if (nodes.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6 tracking-tight">Evidence Graph</h1>
        <div className="glass bg-card p-10 text-center">
          <p className="text-lg text-muted-foreground">No data yet. Start a research session to see the graph.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
      {selected && (
        <div className="glass w-80 border-l p-4 overflow-y-auto text-sm space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase">{selected.type}</p>
          <p>{(selected.data as { label: string }).label}</p>
        </div>
      )}
    </div>
  )
}
