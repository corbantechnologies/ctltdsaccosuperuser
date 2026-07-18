"use client";

import React, { useState } from "react";
import { useFetchAuditLogs } from "@/hooks/auditlogs/actions";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AuditLogsPage() {
  const { data: logs, isLoading, error } = useFetchAuditLogs();

  const [searchTerm, setSearchTerm] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [specificDate, setSpecificDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
    </div>
  );
  if (error) return <div className="text-red-500">Error loading audit logs.</div>;

  // Filter logs
  const filteredLogs = logs?.filter((log) => {
    // Text search (action, module, description)
    const textToSearch = `${log.action} ${log.module} ${log.description}`.toLowerCase();
    const matchesText = textToSearch.includes(searchTerm.toLowerCase());

    // User search
    const userToSearch = `${log.user_name} ${log.user_member_no}`.toLowerCase();
    const matchesUser = userToSearch.includes(userSearch.toLowerCase());

    // Date filter
    let matchesDate = true;
    const logDate = new Date(log.created_at).getTime();
    
    if (specificDate) {
      const startOfSpecific = new Date(specificDate).setHours(0, 0, 0, 0);
      const endOfSpecific = new Date(specificDate).setHours(23, 59, 59, 999);
      matchesDate = matchesDate && (logDate >= startOfSpecific && logDate <= endOfSpecific);
    } else {
      if (startDate) {
        matchesDate = matchesDate && logDate >= new Date(startDate).setHours(0, 0, 0, 0);
      }
      if (endDate) {
        matchesDate = matchesDate && logDate <= new Date(endDate).setHours(23, 59, 59, 999);
      }
    }

    return matchesText && matchesUser && matchesDate;
  }) || [];

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getActionColor = (action) => {
    if (!action) return "bg-gray-100 text-gray-800";
    if (action.includes("200") || action.includes("201") || action === "LOGIN") return "bg-green-100 text-green-800 border-green-200";
    if (action.includes("400") || action.includes("401") || action.includes("403") || action.includes("404")) return "bg-amber-100 text-amber-800 border-amber-200";
    if (action.includes("500") || action.includes("ERROR")) return "bg-red-100 text-red-800 border-red-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">System Audit Logs</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded shadow border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <Label htmlFor="search" className="text-sm font-medium text-gray-700">
            Text Search
          </Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="search"
              placeholder="Action, Module, Desc..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="userSearch" className="text-sm font-medium text-gray-700">
            User Search
          </Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="userSearch"
              placeholder="Name or Member No..."
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="specificDate" className="text-sm font-medium text-gray-700">
            Specific Date
          </Label>
          <Input
            id="specificDate"
            type="date"
            value={specificDate}
            onChange={(e) => {
              setSpecificDate(e.target.value);
              if (e.target.value) {
                setStartDate("");
                setEndDate("");
              }
              setCurrentPage(1);
            }}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
            Start Date
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (e.target.value) setSpecificDate("");
              setCurrentPage(1);
            }}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
            End Date
          </Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              if (e.target.value) setSpecificDate("");
              setCurrentPage(1);
            }}
            className="mt-1"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                  <TableHead className="text-black font-semibold">Timestamp</TableHead>
                  <TableHead className="text-black font-semibold">User</TableHead>
                  <TableHead className="text-black font-semibold">Action</TableHead>
                  <TableHead className="text-black font-semibold">Module</TableHead>
                  <TableHead className="text-black font-semibold">IP Address</TableHead>
                  <TableHead className="text-black font-semibold text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="whitespace-nowrap font-medium text-slate-600 text-sm">
                      {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      {log.user_name ? `${log.user_name} (${log.user_member_no})` : "System/Anonymous"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold tracking-wide uppercase">
                        {log.module}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm font-mono">{log.ip_address || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedLog(log)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!paginatedLogs || paginatedLogs.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">No logs found.</TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {filteredLogs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredLogs.length)}{" "}
              of {filteredLogs.length} logs
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-black text-black hover:bg-gray-100"
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2))
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 py-1 text-gray-500">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={
                        currentPage === page
                          ? "bg-[#ea1315] text-white hover:bg-[#c71012]"
                          : "border-black text-black hover:bg-gray-100"
                      }
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-black text-black hover:bg-gray-100"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* JSON Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
          <div className="bg-white rounded shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Audit Log Details</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedLog(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Action</p>
                  <Badge variant="outline" className={`mt-1 ${getActionColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">User</p>
                  <p className="font-medium mt-1">{selectedLog.user_name || "System"} ({selectedLog.user_member_no || "N/A"})</p>
                </div>
              </div>
              
              <div className="border-b pb-4 bg-slate-50 p-4 rounded border">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Description</p>
                <p className="text-slate-800 text-sm leading-relaxed">{selectedLog.description || "No description provided."}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2 border-b pb-1">Request Payload</h4>
                <div className="bg-slate-900 rounded p-4 overflow-x-auto">
                  <pre className="text-green-400 text-xs font-mono">
                    {selectedLog.request_payload 
                      ? JSON.stringify(selectedLog.request_payload, null, 2) 
                      : "No request payload"}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2 border-b pb-1">Response Payload</h4>
                <div className="bg-slate-900 rounded p-4 overflow-x-auto">
                  <pre className="text-blue-400 text-xs font-mono">
                    {selectedLog.response_payload 
                      ? JSON.stringify(selectedLog.response_payload, null, 2) 
                      : "No response payload"}
                  </pre>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button onClick={() => setSelectedLog(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
