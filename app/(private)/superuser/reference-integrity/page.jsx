"use client";

import React, { useState, useEffect, useCallback } from "react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { getReferenceIntegrity, repairReferenceIntegrity } from "@/services/systemintegrity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Wrench,
  Database,
  History,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ReferenceIntegrityPage() {
  const token = useAxiosAuth();
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [report, setReport] = useState(null);
  const [fixModalOpen, setFixModalOpen] = useState(false);
  const [recentFixes, setRecentFixes] = useState([]);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReferenceIntegrity(token);
      setReport(data);
    } catch (err) {
      console.error("Failed to fetch reference integrity:", err);
      toast.error("Failed to load reference integrity report.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleFix = async () => {
    try {
      setFixing(true);
      const result = await repairReferenceIntegrity(token);
      toast.success(result?.message || "Reference integrity resolution completed!");
      if (result?.fixed_items) {
        setRecentFixes(result.fixed_items);
      }
      setFixModalOpen(false);
      await fetchReport();
    } catch (err) {
      console.error("Failed to repair references:", err);
      toast.error("Failed to apply automated reference repairs.");
    } finally {
      setFixing(false);
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "HIGH":
        return <Badge className="bg-red-100 text-red-800 border-red-200">High Risk</Badge>;
      case "MEDIUM":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Collision Hazard</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Notice</Badge>;
    }
  };

  const isHealthy = report?.healthy ?? true;
  const issuesCount = report?.issues_count ?? 0;
  const totalChecked = report?.total_checked ?? 0;
  const stats = report?.stats || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Reference Integrity & System Health
            </h1>
            <Badge
              variant="outline"
              className={
                isHealthy
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
                  : "bg-red-50 text-red-700 border-red-200 font-semibold"
              }
            >
              {isHealthy ? "System Healthy" : "Action Needed"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Superuser audit tool: scans all transactions, identifies collision hazards, and guarantees unique accounting references.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReport}
            disabled={loading}
            className="flex-1 sm:flex-initial h-9 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Scan System
          </Button>

          <Button
            size="sm"
            onClick={() => setFixModalOpen(true)}
            disabled={loading || fixing || isHealthy}
            className="flex-1 sm:flex-initial h-9 text-xs bg-primary hover:bg-[#022007] text-white shadow-sm font-medium"
          >
            <Wrench className="mr-1.5 h-3.5 w-3.5" />
            Resolve Collisions
          </Button>
        </div>
      </div>

      {/* 4-Card Overview Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: System Status */}
        <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</span>
              {isHealthy ? (
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              )}
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-5 pb-4">
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {isHealthy ? "Collision-Free" : `${issuesCount} Hazard(s)`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isHealthy ? "All database references are globally unique" : "Legacy or conflicting references detected"}
            </p>
          </CardContent>
        </Card>

        {/* Metric 2: Total Records Checked */}
        <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Records Scanned</span>
              <Database className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-5 pb-4">
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {totalChecked.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Across 8 financial & operational tables
            </p>
          </CardContent>
        </Card>

        {/* Metric 3: Journal Batches */}
        <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Journal Batches</span>
              <FileCheck2 className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-5 pb-4">
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {(stats.JournalBatch || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {(stats.PostingLog || 0).toLocaleString()} associated posting logs
            </p>
          </CardContent>
        </Card>

        {/* Metric 4: Reversals Logged */}
        <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reversal Records</span>
              <History className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-5 pb-4">
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {(stats.Reversal || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Contra-postings with verified unique tokens
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Audit Diagnostic Card */}
      <Card className="border border-slate-200 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                Reference Audit Diagnostics
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Real-time inspection of database references against unique constraints
              </CardDescription>
            </div>
            {issuesCount > 0 && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                {issuesCount} Issue(s) Found
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span>Scanning database tables for reference integrity...</span>
            </div>
          ) : isHealthy ? (
            <div className="py-16 text-center flex flex-col items-center justify-center p-6 space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                Zero Reference Collisions Detected
              </h3>
              <p className="text-xs text-muted-foreground max-w-md">
                All accounting batches, posting logs, and transactions adhere to globally unique references. Reversals and loan resets are guaranteed collision-free.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-xs">Severity</TableHead>
                    <TableHead className="text-xs">Table</TableHead>
                    <TableHead className="text-xs">Reference</TableHead>
                    <TableHead className="text-xs">Issue Type</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs text-right">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report?.issues?.map((issue, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/50">
                      <TableCell className="text-xs py-3">
                        {getSeverityBadge(issue.severity)}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-700">
                        {issue.table}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-medium text-slate-900">
                        {issue.reference || "N/A"}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-[10px] py-0 font-normal">
                          {issue.issue_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 max-w-md">
                        {issue.description}
                      </TableCell>
                      <TableCell className="text-xs text-right text-muted-foreground whitespace-nowrap">
                        {issue.created_at ? issue.created_at.slice(0, 19).replace("T", " ") : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Breakdown & Recent Fixes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Table Records Breakdown */}
        <Card className="border border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
              <Database className="h-4 w-4 text-slate-500" /> Monitored Database Models
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 divide-y divide-slate-100">
            {Object.entries(stats).map(([model, count]) => (
              <div key={model} className="flex justify-between items-center py-2 text-xs">
                <span className="text-slate-600 font-medium">{model}</span>
                <span className="font-mono text-slate-900 font-semibold">{count.toLocaleString()} rows</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Resolution History / Actions Card */}
        <Card className="border border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
              <Sparkles className="h-4 w-4 text-emerald-600" /> Automated Repair Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-3">
            <p className="text-xs text-slate-600">
              The automated resolution engine enforces the following invariants:
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Appends cryptographically random tokens to legacy deterministic <span className="font-mono text-slate-800">REV-</span> references.</li>
              <li>Atomically updates <span className="font-mono text-slate-800">PostingLog.reference</span> and <span className="font-mono text-slate-800">record.batch</span> keys.</li>
              <li>Eliminates duplicate references while preserving foreign-key relations and audit trails.</li>
            </ul>

            {recentFixes.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-emerald-700 mb-2">
                  Recent Fixes Applied ({recentFixes.length}):
                </p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {recentFixes.map((f, i) => (
                    <div key={i} className="text-[11px] font-mono text-slate-600 flex justify-between bg-slate-50 p-1.5 rounded">
                      <span className="truncate">{f.old_reference}</span>
                      <span className="text-emerald-700 font-bold ml-2">→ {f.new_reference}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog for Repair */}
      <Dialog open={fixModalOpen} onOpenChange={setFixModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Wrench className="h-5 w-5 text-primary" />
              Auto-Resolve Reference Collisions
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 pt-2">
              This will atomically re-key all legacy deterministic reversal references with unique random tokens and update associated posting logs. No financial balances or accounting entries will be altered.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              This operation executes inside a single database transaction with automatic rollback if any validation fails.
            </span>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFixModalOpen(false)}
              disabled={fixing}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleFix}
              disabled={fixing}
              className="bg-primary hover:bg-[#022007] text-white text-xs h-9 shadow-sm"
            >
              {fixing ? (
                <>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Resolving...
                </>
              ) : (
                "Proceed with Resolution"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
