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
import { Network, ScanSearch } from "lucide-react"
import { ContextPanel } from "@/components/ContextPanel"
import { ResearchTabs } from "@/components/ResearchTabs"
import { EmptyState } from "@/components/EmptyState"
import { getClaims, getEvidence, getSources } from "@/lib/api"
import { hostname } from "@/lib/format"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Claim, Evidence, Source } from "@/types"

function ClaimNode({ data }: NodeProps) {
  return (
    <div className="w-60 rounded-lg border border-primary/30 bg-card p-3 shadow-lg shadow-black/30">
      <Handle type="target" position={Position.Top} className="!border-primary/50" />
      <Handle type="source" position={Position.Bottom} className="!border-primary/50" />
      <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-primary uppercase">
        <ScanSearch className="size-3" /> Claim
      </p>
      <p className="text-[13px] leading-snug text-foreground">{data.label as string}</p>
    </div>
  )
}

function EvidenceNode({ data }: NodeProps) {
  return (
    <div className="w-56 rounded-lg border border-violet-400/25 bg-card p-3 shadow-lg shadow-black/30">
      <Handle type="target" position={Position.Top} className="!border-violet-400/50" />
      <Handle type="source" position={Position.Bottom} className="!border-violet-400/50" />
      <p className="mb-1 text-[10px] font-semibold tracking-wider text-violet-400 uppercase">
        Evidence
      </p>
      <p className="line-clamp-3 text-xs leading-snug text-muted-foreground">
        {data.label as string}
      </p>
    </div>
  )
}

function SourceNode({ data }: NodeProps) {
  return (
    <div className="w-48 rounded-lg border border-success/25 bg-card p-3 shadow-lg shadow-black/30">
      <Handle type="target" position={Position.Top} className="!border-success/50" />
      <p className="mb-1 text-[10px] font-semibold tracking-wider text-success uppercase">
        Source
      </p>
      <p className="truncate text-xs text-muted-foreground">{data.label as string}</p>
    </div>
  )
}

const nodeTypes = {
  claim: ClaimNode,
  evidence: EvidenceNode,
  source: SourceNode,
}

type FlowNode = Node<{ label: string; url?: string }, "claim" | "evidence" | "source">

interface Selection {
  type: string
  label: string
  url?: string
}

export default function GraphPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selected, setSelected] = useState<Selection | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      const [claims, evidence, sources] = await Promise.all([
        getClaims(id),
        getEvidence(id),
        getSources(id),
      ])
      if (!active) return

      const claimNodes: FlowNode[] = (claims as Claim[]).map((c, i) => ({
        id: c.id,
        type: "claim",
        position: { x: 300, y: i * 160 },
        data: { label: c.claim.length > 90 ? c.claim.slice(0, 90) + "…" : c.claim },
      }))

      const evidenceNodes: FlowNode[] = ((evidence as Evidence[]) || []).map((e, i) => ({
        id: e.id,
        type: "evidence",
        position: { x: 620, y: i * 120 },
        data: { label: e.passage.length > 120 ? e.passage.slice(0, 120) + "…" : e.passage },
      }))

      const sourceNodes: FlowNode[] = ((sources as Source[]) || []).map((s, i) => ({
        id: s.id,
        type: "source",
        position: { x: 940, y: i * 90 },
        data: { label: s.title || hostname(s.url), url: s.url },
      }))

      const edgesList: Edge[] = []
      for (const e of evidence as Evidence[]) {
        edgesList.push({
          id: `ce-${e.id}`,
          source: e.claim_id,
          target: e.id,
          type: "smoothstep",
          style: { stroke: "#0a84ff", opacity: 0.35 },
        })
        if (e.source_id) {
          edgesList.push({
            id: `es-${e.id}`,
            source: e.id,
            target: e.source_id,
            type: "smoothstep",
            style: { stroke: "#22c55e", opacity: 0.25 },
          })
        }
      }

      setNodes([...claimNodes, ...evidenceNodes, ...sourceNodes])
      setEdges(edgesList)
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [id, setNodes, setEdges])

  const onNodeClick = (_: React.MouseEvent, node: FlowNode) => {
    setSelected({ type: node.type ?? "", label: node.data.label, url: node.data.url })
  }

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="flex-1 p-10">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">Evidence Graph</h1>
        <ResearchTabs id={id} active="graph" />
        <div className="mt-8">
          <EmptyState
            icon={Network}
            title="Nothing to graph yet"
            description="Claims, evidence and their sources will appear here once research produces results."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <div className="min-w-0 flex-1">
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <h1 className="text-sm font-semibold text-foreground">Evidence Graph</h1>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-primary" /> Claims
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-violet-400" /> Evidence
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-success" /> Sources
            </span>
          </div>
        </div>
        <div className="h-[calc(100%-3.5rem)]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            minZoom={0.2}
            className="bg-[#10131a]"
          >
            <Background color="#ffffff12" gap={22} size={1} />
            <Controls className="!border-border !bg-card !shadow-lg" />
            <MiniMap
              nodeColor="#27272a"
              maskColor="rgba(9,9,11,0.7)"
              className="!bg-card !border-border"
            />
          </ReactFlow>
        </div>
      </div>

      <ContextPanel title="Selection" icon={<Network className="size-4 text-primary" />}>
        {selected ? (
          <div className="space-y-3">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1",
                selected.type === "claim" && "bg-primary/10 text-primary ring-primary/20",
                selected.type === "evidence" && "bg-violet-400/10 text-violet-300 ring-violet-400/20",
                selected.type === "source" && "bg-success/10 text-success ring-success/20"
              )}
            >
              {selected.type}
            </span>
            <p className="text-sm leading-relaxed text-foreground">{selected.label}</p>
            {selected.url && (
              <a
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-xs text-primary hover:underline"
              >
                {selected.url}
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click any node to inspect it.
          </p>
        )}
      </ContextPanel>
    </div>
  )
}