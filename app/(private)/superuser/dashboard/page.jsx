"use client";

import React, { useState } from "react";
import { useFetchMember, useFetchMembers } from "@/hooks/members/actions";
import { useFetchSavingsTypes } from "@/hooks/savingtypes/actions";
import { useFetchLoanProducts } from "@/hooks/loanproducts/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Wallet,
  CreditCard,
  TrendingUp,
  Plus,
} from "lucide-react";

import SaccoMembersTable from "@/components/members/SaccoMembersTable";
import CreateMember from "@/forms/members/CreateMember";
import LoadingSpinner from "@/components/general/LoadingSpinner";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchFeeTypes } from "@/hooks/feetypes/actions";

export default function SaccoAdminDashboard() {
  const token = useAxiosAuth()
  const { data: myself, isLoading: isLoadingMyself } = useFetchMember();
  const {
    data: members,
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
  } = useFetchMembers();
  const {
    data: savingTypes,
    isLoading: isLoadingSavingTypes,
    refetch: refetchSavingTypes,
  } = useFetchSavingsTypes();
  const {
    data: loanProducts,
    isLoading: isLoadingLoanProducts,
    refetch: refetchLoanProducts,
  } = useFetchLoanProducts();
  const {
    data: feeTypes,
    isLoading: isLoadingFeeTypes,
    refetch: refetchFeeTypes,
  } = useFetchFeeTypes();

  const [createMemberOpen, setCreateMemberOpen] = useState(false);

  if (
    isLoadingMyself ||
    isLoadingMembers ||
    isLoadingSavingTypes ||
    isLoadingLoanProducts ||
    isLoadingFeeTypes
  ) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 mt-1 text-lg">
            Manage members, products, and configurations.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded border shadow-sm">
          <p className="text-sm font-medium text-gray-900">
            {myself?.salutation} {myself?.last_name} (Admin)
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-[var(--accent)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-[var(--accent)]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-slate-900">
              {members?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saving Types
            </CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{savingTypes?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Loan Products
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {loanProducts?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fee Types
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {feeTypes?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[600px] h-auto bg-white border">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="savings">Saving Types</TabsTrigger>
          <TabsTrigger value="loans">Loan Products</TabsTrigger>
          <TabsTrigger value="fee">Fee Types</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="pt-6">
          <div className="flex justify-end mb-4">
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => setCreateMemberOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Member
            </Button>
          </div>
          <SaccoMembersTable members={members} />
        </TabsContent>

        {/* Saving Types Tab */}
        <TabsContent value="savings" className="pt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Saving Types</CardTitle>

            </CardHeader>
            <CardContent className="overflow-x-auto">
              {savingTypes?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Interest Rate</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Can Guarantee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savingTypes.map((type) => (
                      <TableRow key={type.id || type.reference}>
                        <TableCell className="font-medium">
                          {type.name}
                        </TableCell>
                        <TableCell>{type.interest_rate}%</TableCell>
                        <TableCell>{type.description || "-"}</TableCell>
                        <TableCell>
                          {type.can_guarantee ? "Yes" : "No"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No saving types found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loan Products Tab */}
        <TabsContent value="loans" className="pt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Loan Products</CardTitle>

            </CardHeader>
            <CardContent className="overflow-x-auto">
              {loanProducts?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Interest Method</TableHead>
                      <TableHead>Interest Rate</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanProducts.map((product) => (
                      <TableRow key={product.id || product.reference}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.interest_method}</TableCell>
                        <TableCell>{product.interest_rate}%</TableCell>
                        <TableCell>{product.description || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No loan products found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Types Tab */}
        <TabsContent value="fee" className="pt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fee Types</CardTitle>

            </CardHeader>
            <CardContent className="overflow-x-auto">
              {feeTypes?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Applies All</TableHead>
                      <TableHead>Exceeds Limit</TableHead>
                      <TableHead>Gl Account</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeTypes.map((type) => (
                      <TableRow key={type.id || type.reference}>
                        <TableCell className="font-medium">
                          {type.name}
                        </TableCell>
                        <TableCell>{type.amount}</TableCell>
                        <TableCell>{type.is_everyone ? "Yes" : "No"}</TableCell>
                        <TableCell>{type.can_exceed_limit ? "Yes" : "No"}</TableCell>
                        <TableCell>{type.gl_account || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No fee types found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateMember
        openModal={createMemberOpen}
        closeModal={() => {
          setCreateMemberOpen(false);
          refetchMembers();
        }}
      />
    </div>
  );
}
