import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Plus,
  Search,
  Filter,
  Package,
  Edit2,
  Trash2,
  Users,
  FileQuestion,
  TrendingUp,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { PackEditDialog } from "../components/admin/PackEditDialog";

interface Pack {
  id: number;
  slug: string;
  name_en: string;
  name_hu: string;
  description_en: string | null;
  description_hu: string | null;
  access_level: string;
  pack_type: string;
  is_active: boolean;
  is_published: boolean;
  display_order: number;
  creator_id: number | null;
  creator_email: string | null;
  created_at: string;
  updated_at: string;
  question_count: number;
  total_plays: number;
}

export function PacksPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPacks, setTotalPacks] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [packTypeFilter, setPackTypeFilter] = useState("all");
  const [accessLevelFilter, setAccessLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit dialog state
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Delete confirmation dialog
  const [packToDelete, setPackToDelete] = useState<Pack | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pack type icons and colors
  const getPackTypeInfo = (type: string) => {
    const types: Record<
      string,
      { icon: string; color: string; label: string }
    > = {
      quiz: {
        icon: "🎯",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        label: "Quiz",
      },
      challenge: {
        icon: "⚡",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        label: "Challenge",
      },
      learning: {
        icon: "📚",
        color: "bg-green-50 text-green-700 border-green-200",
        label: "Learning",
      },
      party: {
        icon: "🎉",
        color: "bg-purple-50 text-purple-700 border-purple-200",
        label: "Party",
      },
      kids: {
        icon: "👶",
        color: "bg-pink-50 text-pink-700 border-pink-200",
        label: "Kids",
      },
      expert: {
        icon: "🏆",
        color: "bg-orange-50 text-orange-700 border-orange-200",
        label: "Expert",
      },
      seasonal: {
        icon: "🎄",
        color: "bg-red-50 text-red-700 border-red-200",
        label: "Seasonal",
      },
      custom: {
        icon: "✨",
        color: "bg-gray-50 text-gray-700 border-gray-200",
        label: "Custom",
      },
    };
    return types[type] || types.custom;
  };

  const getAccessLevelBadge = (level: string) => {
    const levels: Record<string, { color: string; label: string }> = {
      free: {
        color: "bg-green-50 text-green-700 border-green-200",
        label: "Free",
      },
      premium: {
        color: "bg-purple-50 text-purple-700 border-purple-200",
        label: "Premium",
      },
      admin_only: {
        color: "bg-red-50 text-red-700 border-red-200",
        label: "Admin Only",
      },
    };
    const info = levels[level] || levels.free;
    return (
      <Badge variant="outline" className={info.color}>
        {info.label}
      </Badge>
    );
  };

  // Fetch packs
  const fetchPacks = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (packTypeFilter !== "all") params.append("pack_type", packTypeFilter);
      if (accessLevelFilter !== "all")
        params.append("access_level", accessLevelFilter);
      if (statusFilter === "active") {
        params.append("is_active", "true");
        params.append("is_published", "true");
      } else if (statusFilter === "inactive") {
        params.append("is_active", "false");
      } else if (statusFilter === "unpublished") {
        params.append("is_published", "false");
      }

      const response = await fetch(`/api/admin?endpoint=packs&${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch packs");
      }

      const data = await response.json();
      let filteredPacks = data.packs || [];

      // Client-side search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredPacks = filteredPacks.filter(
          (pack: Pack) =>
            pack.name_en?.toLowerCase().includes(query) ||
            pack.name_hu?.toLowerCase().includes(query) ||
            pack.slug?.toLowerCase().includes(query) ||
            pack.description_en?.toLowerCase().includes(query) ||
            pack.description_hu?.toLowerCase().includes(query)
        );
      }

      setPacks(filteredPacks);
      setTotalPacks(data.total || filteredPacks.length);
    } catch (error) {
      console.error("Error fetching packs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, [packTypeFilter, accessLevelFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPacks();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleNewPack = () => {
    setSelectedPack(null);
    setIsEditDialogOpen(true);
  };

  const handleEditPack = (pack: Pack) => {
    setSelectedPack(pack);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (pack: Pack) => {
    setPackToDelete(pack);
  };

  const handleDeleteConfirm = async () => {
    if (!packToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/packs/${packToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to delete pack");
        return;
      }

      // Refresh pack list
      fetchPacks();
    } catch (error) {
      console.error("Error deleting pack:", error);
      alert("Failed to delete pack");
    } finally {
      setIsDeleting(false);
      setPackToDelete(null);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pack Management</h1>
            <p className="text-muted-foreground">
              Manage question packs and their settings
            </p>
          </div>
          <Button onClick={handleNewPack}>
            <Plus className="h-4 w-4 mr-2" />
            New Pack
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <Input
                  placeholder="Search packs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Select value={packTypeFilter} onValueChange={setPackTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="quiz">🎯 Quiz</SelectItem>
                  <SelectItem value="challenge">⚡ Challenge</SelectItem>
                  <SelectItem value="learning">📚 Learning</SelectItem>
                  <SelectItem value="party">🎉 Party</SelectItem>
                  <SelectItem value="kids">👶 Kids</SelectItem>
                  <SelectItem value="expert">🏆 Expert</SelectItem>
                  <SelectItem value="seasonal">🎄 Seasonal</SelectItem>
                  <SelectItem value="custom">✨ Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={accessLevelFilter}
                onValueChange={setAccessLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All access levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All access levels</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="admin_only">Admin Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active & Published</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="unpublished">Unpublished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Packs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPacks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Packs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {packs.filter((p) => p.is_active && p.is_published).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {packs.reduce((sum, p) => sum + p.question_count, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Plays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {packs.reduce((sum, p) => sum + p.total_plays, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packs Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading packs...</p>
        </div>
      ) : packs.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-2">
              <Package className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No packs found</p>
              <Button onClick={handleNewPack} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create your first pack
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packs.map((pack) => {
            const typeInfo = getPackTypeInfo(pack.pack_type);
            return (
              <Card key={pack.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <Badge variant="outline" className={typeInfo.color}>
                        {typeInfo.label}
                      </Badge>
                    </div>
                    {getAccessLevelBadge(pack.access_level)}
                  </div>
                  <CardTitle className="line-clamp-1">
                    {pack.name_en || pack.name_hu || "Unnamed Pack"}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {pack.description_en ||
                      pack.description_hu ||
                      "No description"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow">
                  <div className="space-y-3">
                    {/* Slug */}
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Slug:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {pack.slug}
                      </code>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <FileQuestion className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Questions:
                        </span>
                        <span className="font-semibold">
                          {pack.question_count}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Plays:</span>
                        <span className="font-semibold">
                          {pack.total_plays}
                        </span>
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex gap-2 flex-wrap">
                      {pack.is_published ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200">
                          Published
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Draft
                        </Badge>
                      )}
                      {pack.is_active ? (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-gray-50 text-gray-700 border-gray-200">
                          Inactive
                        </Badge>
                      )}
                    </div>

                    {/* Creator & dates */}
                    <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                      {pack.creator_email && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>Created by: {pack.creator_email}</span>
                        </div>
                      )}
                      <div>
                        Updated{" "}
                        {formatDistanceToNow(new Date(pack.updated_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEditPack(pack)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteClick(pack)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <PackEditDialog
        pack={selectedPack}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onPackUpdated={fetchPacks}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!packToDelete}
        onOpenChange={(open) => !open && setPackToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pack?</AlertDialogTitle>
            <AlertDialogDescription>
              {packToDelete && packToDelete.question_count > 0 ? (
                <>
                  Cannot delete pack "{packToDelete.name_en}" because it
                  contains {packToDelete.question_count} question(s). Please
                  remove or reassign all questions first.
                </>
              ) : (
                <>
                  Are you sure you want to delete pack "
                  {packToDelete?.name_en || packToDelete?.name_hu}"? This action
                  cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            {packToDelete && packToDelete.question_count === 0 && (
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700">
                {isDeleting ? "Deleting..." : "Delete Pack"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
