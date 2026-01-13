"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  Layers,
  FolderTree,
  Check,
  X,
  Loader2
} from "lucide-react";
import {
  createLevel1,
  createLevel2,
  createLeaf,
  updateLevel1,
  updateLevel2,
  updateLeaf,
  deleteLevel1,
  deleteLevel2,
  deleteLeaf
} from "@/lib/actions/taxonomy";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TaxonomyClientProps {
  initialTaxonomy: any[];
}

export function TaxonomyClient({ initialTaxonomy }: TaxonomyClientProps) {
  const [taxonomy, setTaxonomy] = useState(initialTaxonomy);
  const [expandedL1, setExpandedL1] = useState<Set<string>>(new Set());
  const [expandedL2, setExpandedL2] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [addingTo, setAddingTo] = useState<{ type: "l1" | "l2" | "leaf"; parentId?: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();

  const toggleL1 = (id: string) => {
    const newSet = new Set(expandedL1);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedL1(newSet);
  };

  const toggleL2 = (id: string) => {
    const newSet = new Set(expandedL2);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedL2(newSet);
  };

  const handleAdd = (type: "l1" | "l2" | "leaf", parentId?: string) => {
    setAddingTo({ type, parentId });
    setNewName("");
  };

  const confirmAdd = async () => {
    if (!addingTo || !newName.trim()) return;

    startTransition(async () => {
      try {
        if (addingTo.type === "l1") {
          const res = await createLevel1(newName);
          if (res.success) {
            toast.success("Categoria Level 1 criada");
            window.location.reload();
          }
        } else if (addingTo.type === "l2" && addingTo.parentId) {
          const res = await createLevel2(addingTo.parentId, newName);
          if (res.success) {
            toast.success("Categoria Level 2 criada");
            window.location.reload();
          }
        } else if (addingTo.type === "leaf" && addingTo.parentId) {
          const res = await createLeaf(addingTo.parentId, newName);
          if (res.success) {
            toast.success("Categoria Leaf criada");
            window.location.reload();
          }
        }
      } catch (error) {
        toast.error("Erro ao criar categoria");
      }
      setAddingTo(null);
      setNewName("");
    });
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const confirmEdit = async (type: "l1" | "l2" | "leaf") => {
    if (!editingId || !editValue.trim()) return;

    startTransition(async () => {
      try {
        if (type === "l1") {
          await updateLevel1(editingId, editValue);
        } else if (type === "l2") {
          await updateLevel2(editingId, editValue);
        } else {
          await updateLeaf(editingId, editValue);
        }
        toast.success("Categoria atualizada");
        window.location.reload();
      } catch (error) {
        toast.error("Erro ao atualizar");
      }
      setEditingId(null);
    });
  };

  const handleDelete = async (type: "l1" | "l2" | "leaf", id: string) => {
    if (!confirm("Tem certeza? Isso excluirá todas as subcategorias.")) return;

    startTransition(async () => {
      try {
        if (type === "l1") {
          await deleteLevel1(id);
        } else if (type === "l2") {
          await deleteLevel2(id);
        } else {
          await deleteLeaf(id);
        }
        toast.success("Categoria excluída");
        window.location.reload();
      } catch (error) {
        toast.error("Erro ao excluir");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
            <FolderTree className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Hierarquia de Categorias</h1>
            <p className="text-sm text-muted-foreground">Organize sua taxonomia de classificação</p>
          </div>
        </div>
        <Button
          onClick={() => handleAdd("l1")}
          className="gap-2 bg-violet-600 hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Add L1 Input */}
      {addingTo?.type === "l1" && (
        <div className="flex items-center gap-2 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome da categoria..."
            className="flex-1"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && confirmAdd()}
          />
          <Button onClick={confirmAdd} disabled={isPending} size="sm" className="gap-1">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </Button>
          <Button onClick={() => setAddingTo(null)} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Taxonomy Tree */}
      <div className="space-y-2">
        {taxonomy.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Layers className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Nenhuma categoria definida.</p>
            <p className="text-sm">Clique em "Nova Categoria" para começar.</p>
          </div>
        ) : (
          taxonomy.map((l1) => (
            <div key={l1.level1Id} className="border border-border rounded-xl overflow-hidden bg-card">
              {/* Level 1 Header */}
              <div className="flex items-center gap-2 p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <button onClick={() => toggleL1(l1.level1Id)} className="p-1 hover:bg-secondary rounded">
                  {expandedL1.has(l1.level1Id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {editingId === l1.level1Id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-8"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && confirmEdit("l1")}
                    />
                    <Button onClick={() => confirmEdit("l1")} size="sm" disabled={isPending}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => setEditingId(null)} variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-semibold flex-1">{l1.nivel1Pt}</span>
                    <Badge variant="secondary">{l1.level2s?.length || 0} subcategorias</Badge>
                    <button
                      onClick={() => startEdit(l1.level1Id, l1.nivel1Pt)}
                      className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleAdd("l2", l1.level1Id)}
                      className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete("l1", l1.level1Id)}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Level 2 Items */}
              {expandedL1.has(l1.level1Id) && (
                <div className="border-t border-border">
                  {/* Add L2 Input */}
                  {addingTo?.type === "l2" && addingTo.parentId === l1.level1Id && (
                    <div className="flex items-center gap-2 p-3 pl-10 bg-emerald-50 dark:bg-emerald-900/20">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nome da subcategoria..."
                        className="flex-1 h-8"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && confirmAdd()}
                      />
                      <Button onClick={confirmAdd} disabled={isPending} size="sm">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => setAddingTo(null)} variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {l1.level2s?.map((l2: any) => (
                    <div key={l2.level2Id}>
                      <div className="flex items-center gap-2 p-3 pl-10 hover:bg-secondary/30 transition-colors border-b border-border/50 last:border-0">
                        <button onClick={() => toggleL2(l2.level2Id)} className="p-1 hover:bg-secondary rounded">
                          {expandedL2.has(l2.level2Id) ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </button>

                        {editingId === l2.level2Id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-7 text-sm"
                              autoFocus
                              onKeyDown={(e) => e.key === "Enter" && confirmEdit("l2")}
                            />
                            <Button onClick={() => confirmEdit("l2")} size="sm" disabled={isPending}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button onClick={() => setEditingId(null)} variant="ghost" size="sm">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm flex-1">{l2.nivel2Pt}</span>
                            <Badge variant="outline" className="text-xs">{l2.leaves?.length || 0}</Badge>
                            <button
                              onClick={() => startEdit(l2.level2Id, l2.nivel2Pt)}
                              className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleAdd("leaf", l2.level2Id)}
                              className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDelete("l2", l2.level2Id)}
                              className="p-1 hover:bg-red-100 rounded text-muted-foreground hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Leaf Items */}
                      {expandedL2.has(l2.level2Id) && (
                        <div className="pl-16 border-l-2 border-border ml-10">
                          {/* Add Leaf Input */}
                          {addingTo?.type === "leaf" && addingTo.parentId === l2.level2Id && (
                            <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20">
                              <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Nome do item..."
                                className="flex-1 h-7 text-sm"
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && confirmAdd()}
                              />
                              <Button onClick={confirmAdd} disabled={isPending} size="sm">
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button onClick={() => setAddingTo(null)} variant="ghost" size="sm">
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}

                          {l2.leaves?.map((leaf: any) => (
                            <div key={leaf.leafId} className="flex items-center gap-2 p-2 hover:bg-secondary/30 transition-colors group">
                              {editingId === leaf.leafId ? (
                                <div className="flex-1 flex items-center gap-2">
                                  <Input
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="h-6 text-xs"
                                    autoFocus
                                    onKeyDown={(e) => e.key === "Enter" && confirmEdit("leaf")}
                                  />
                                  <Button onClick={() => confirmEdit("leaf")} size="sm" disabled={isPending}>
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button onClick={() => setEditingId(null)} variant="ghost" size="sm">
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-xs text-muted-foreground flex-1">{leaf.nivel3Pt}</span>
                                  <button
                                    onClick={() => startEdit(leaf.leafId, leaf.nivel3Pt)}
                                    className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete("leaf", leaf.leafId)}
                                    className="p-1 hover:bg-red-100 rounded text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
