import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  FileQuestion,
} from "lucide-react";

interface Question {
  id: number;
  setId: number;
  setName: string;
  questionEn: string;
  questionHu: string;
  category: string;
  difficulty: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  timesPlayed: number;
  timesCompleted: number;
  answerCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchQuestions();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch questions
  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        category: categoryFilter,
        difficulty: difficultyFilter,
        is_active: statusFilter,
        search: searchQuery,
      });

      const response = await fetch(`/api/admin/questions?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();
      setQuestions(data.questions);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [pagination.page, categoryFilter, difficultyFilter, statusFilter]);

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      entertainment: "bg-purple-50 text-purple-700 border-purple-200",
      travel: "bg-blue-50 text-blue-700 border-blue-200",
      sports: "bg-green-50 text-green-700 border-green-200",
      technology: "bg-orange-50 text-orange-700 border-orange-200",
      gastronomy: "bg-red-50 text-red-700 border-red-200",
      culture: "bg-pink-50 text-pink-700 border-pink-200",
    };

    return (
      <Badge variant="outline" className={colors[category] || ""}>
        {category}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: string | null) => {
    if (!difficulty) return <Badge variant="outline">—</Badge>;

    const colors: Record<string, string> = {
      easy: "bg-green-50 text-green-700 border-green-200",
      medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
      hard: "bg-red-50 text-red-700 border-red-200",
    };

    return (
      <Badge variant="outline" className={colors[difficulty] || ""}>
        {difficulty}
      </Badge>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Question Management</h1>
          <p className="text-muted-foreground">
            Manage quiz questions and answers
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Question
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <label className="text-sm font-medium mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="gastronomy">Gastronomy</SelectItem>
                <SelectItem value="culture">Culture</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Difficulty</label>
            <Select
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Answers</TableHead>
              <TableHead>Set</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  Loading questions...
                </TableCell>
              </TableRow>
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FileQuestion className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No questions found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="font-mono text-sm">
                    #{question.id}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="mb-1 font-medium text-sm line-clamp-2">
                      {question.questionEn}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {question.questionHu}
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(question.category)}</TableCell>
                  <TableCell>
                    {getDifficultyBadge(question.difficulty)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{question.answerCount}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {question.setName || `Set #${question.setId}`}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <div>
                        <span className="text-muted-foreground">Played:</span>{" "}
                        {question.timesPlayed}
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Completed:
                        </span>{" "}
                        {question.timesCompleted}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {question.isActive ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-700 border-gray-200">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(question.updatedAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!isLoading && questions.length > 0 && (
          <div className="border-t p-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} questions
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={!pagination.hasPrev}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={!pagination.hasNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
