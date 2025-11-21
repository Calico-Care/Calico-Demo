import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown,
  Search,
  BarChart3,
  FileText,
  Plus,
  Settings,
  Heart,
  RefreshCw
} from "lucide-react";

interface Senior {
  id: string;
  name: string;
  dob: string;
  dataCompletion: number;
  status: "Active" | "Inactive" | "At Risk";
  lastUpdate: string;
}

const sampleSeniors: Senior[] = [
  { id: "1", name: "Burke, Winfried", dob: "2/9/1949", dataCompletion: 0, status: "Active", lastUpdate: "2 days ago" },
  { id: "2", name: "Bond, James", dob: "10/21/1968", dataCompletion: 85, status: "Active", lastUpdate: "1 day ago" },
  { id: "3", name: "Badger, Honey", dob: "12/12/1956", dataCompletion: 92, status: "At Risk", lastUpdate: "3 hours ago" },
  { id: "4", name: "Duck, Daffy Kurt", dob: "10/28/2008", dataCompletion: 45, status: "Active", lastUpdate: "1 week ago" },
  { id: "5", name: "CazanProd1, MihaelaeProd1", dob: "11/8/1983", dataCompletion: 0, status: "Inactive", lastUpdate: "1 month ago" },
  { id: "6", name: "America, Captain", dob: "12/6/1962", dataCompletion: 78, status: "Active", lastUpdate: "5 hours ago" },
  { id: "7", name: "Arcardi, Ken", dob: "11/11/1999", dataCompletion: 0, status: "Active", lastUpdate: "2 days ago" },
  { id: "8", name: "iOS, Stephan", dob: "11/10/1956", dataCompletion: 67, status: "Active", lastUpdate: "1 day ago" },
  { id: "9", name: "Betty, White", dob: "1/5/1938", dataCompletion: 95, status: "Active", lastUpdate: "4 hours ago" },
  { id: "10", name: "Bayer, Mathias", dob: "5/22/1973", dataCompletion: 0, status: "Inactive", lastUpdate: "2 weeks ago" },
];

const SeniorsTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSeniors = sampleSeniors.filter(senior => {
    const matchesSearch = senior.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || senior.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSeniors.length / parseInt(itemsPerPage));
  const startIndex = (currentPage - 1) * parseInt(itemsPerPage);
  const paginatedSeniors = filteredSeniors.slice(startIndex, startIndex + parseInt(itemsPerPage));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "At Risk":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">At Risk</Badge>;
      case "Inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDataCompletionColor = (completion: number) => {
    if (completion === 0) return "text-gray-500";
    if (completion < 50) return "text-red-600";
    if (completion < 80) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">Seniors</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Filter</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="At Risk">At Risk</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Search</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Enter a value"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12"></TableHead>
              <TableHead className="font-semibold text-foreground">Senior Name</TableHead>
              <TableHead className="font-semibold text-foreground">DOB</TableHead>
              <TableHead className="font-semibold text-foreground">Data</TableHead>
              <TableHead className="font-semibold text-foreground">Progress</TableHead>
              <TableHead className="font-semibold text-foreground">Threshold</TableHead>
              <TableHead className="font-semibold text-foreground">Annotations</TableHead>
              <TableHead className="font-semibold text-foreground">Log Data</TableHead>
              <TableHead className="font-semibold text-foreground">Care Plans</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSeniors.map((senior) => (
              <TableRow key={senior.id} className="hover:bg-gray-50">
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{senior.name}</span>
                    <div className="flex items-center mt-1">
                      {getStatusBadge(senior.status)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{senior.dob}</TableCell>
                <TableCell>
                  <span className={`font-semibold ${getDataCompletionColor(senior.dataCompletion)}`}>
                    {senior.dataCompletion === 0 ? "-" : `${senior.dataCompletion}%`}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="w-4 h-4 text-primary" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <FileText className="w-4 h-4 text-primary" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <FileText className="w-4 h-4 text-primary" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="w-4 h-4 text-primary" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4 text-primary" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(startIndex + parseInt(itemsPerPage), filteredSeniors.length)} of {filteredSeniors.length} seniors
          {statusFilter !== "All" && ` (filtered from ${sampleSeniors.length} total seniors)`}
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SeniorsTable;