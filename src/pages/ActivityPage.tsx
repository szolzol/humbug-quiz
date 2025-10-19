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
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  FileEdit,
  Trash2,
  UserPlus,
  Package,
  Activity,
  Calendar,
} from "lucide-react";

interface ActivityLog {
  id: number;
  userId: string;
  actionType: "create" | "update" | "delete";
  entityType: "user" | "question" | "pack";
  entityId: string;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  adminName: string;
  adminEmail: string;
  adminPicture: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
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
  const [actionTypeFilter, setActionTypeFilter] = useState("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch activity logs
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        action_type: actionTypeFilter,
        entity_type: entityTypeFilter,
        admin_user: "all",
      });

      if (startDate) {
        params.append("start_date", startDate);
      }

      if (endDate) {
        params.append("end_date", endDate);
      }

      const response = await fetch(`/api/admin?endpoint=activity&${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch activity logs");
      }

      const data = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, actionTypeFilter, entityTypeFilter, startDate, endDate]);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "create":
        return <UserPlus className="h-4 w-4" />;
      case "update":
        return <FileEdit className="h-4 w-4" />;
      case "delete":
        return <Trash2 className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionBadge = (actionType: string) => {
    switch (actionType) {
      case "create":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200">
            {getActionIcon(actionType)}
            <span className="ml-1">Create</span>
          </Badge>
        );
      case "update":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200">
            {getActionIcon(actionType)}
            <span className="ml-1">Update</span>
          </Badge>
        );
      case "delete":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200">
            {getActionIcon(actionType)}
            <span className="ml-1">Delete</span>
          </Badge>
        );
      default:
        return <Badge>{actionType}</Badge>;
    }
  };

  const getEntityBadge = (entityType: string) => {
    switch (entityType) {
      case "user":
        return <Badge variant="secondary">User</Badge>;
      case "question":
        return <Badge variant="secondary">Question</Badge>;
      case "pack":
        return <Badge variant="secondary">Pack</Badge>;
      default:
        return <Badge variant="secondary">{entityType}</Badge>;
    }
  };

  const getActionDescription = (log: ActivityLog) => {
    const { actionType, entityType, details } = log;

    if (actionType === "update" && entityType === "user") {
      const changes: string[] = [];
      if (details.changes?.role) {
        changes.push(
          `role: ${details.changes.role.from} → ${details.changes.role.to}`
        );
      }
      if (details.changes?.is_active) {
        changes.push(
          `status: ${
            details.changes.is_active.from ? "active" : "inactive"
          } → ${details.changes.is_active.to ? "active" : "inactive"}`
        );
      }
      return changes.join(", ");
    }

    if (actionType === "delete" && entityType === "user") {
      return `Deleted user: ${details.deletedUser?.name || "Unknown"} (${
        details.deletedUser?.email || "no email"
      })`;
    }

    return JSON.stringify(details);
  };

  const handleResetFilters = () => {
    setActionTypeFilter("all");
    setEntityTypeFilter("all");
    setStartDate("");
    setEndDate("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Activity Log</h1>
        <p className="text-muted-foreground">
          Monitor all administrative actions across the platform
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Action Type
            </label>
            <Select
              value={actionTypeFilter}
              onValueChange={setActionTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Entity Type
            </label>
            <Select
              value={entityTypeFilter}
              onValueChange={setEntityTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entities</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="question">Questions</SelectItem>
                <SelectItem value="pack">Packs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="w-full">
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading activity logs...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No activity logs found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={log.adminPicture}
                          alt={log.adminName}
                        />
                        <AvatarFallback>
                          {log.adminName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {log.adminName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.adminEmail}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getActionBadge(log.actionType)}</TableCell>
                  <TableCell>{getEntityBadge(log.entityType)}</TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="text-sm">{getActionDescription(log)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Entity ID: {log.entityId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!isLoading && logs.length > 0 && (
          <div className="border-t p-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} logs
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
