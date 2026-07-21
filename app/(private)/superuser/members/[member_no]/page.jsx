"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useFetchMemberDetail } from "@/hooks/members/actions";
import LoadingSpinner from "@/components/general/LoadingSpinner";
import UpdateMemberRole from "@/forms/members/UpdateMemberRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SuperuserMemberDetail() {
  const { member_no } = useParams();
  const { data: member, isLoading, refetch } = useFetchMemberDetail(member_no);
  const [roleModal, setRoleModal] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  
  if (!member) return <div className="p-8 text-center text-slate-500">Member not found</div>;

  const handleRefetchAll = () => {
    window.location.reload();
  };

  const activeRoles = [];
  if (member?.is_member) activeRoles.push("Member");
  if (member?.is_sacco_admin) activeRoles.push("SACCO Admin");
  if (member?.is_sacco_staff) activeRoles.push("SACCO Staff");
  if (member?.is_treasurer) activeRoles.push("Treasurer");
  if (member?.is_bookkeeper) activeRoles.push("Bookkeeper");
  if (member?.is_system_admin) activeRoles.push("System Admin");
  if (member?.is_staff) activeRoles.push("Staff");
  if (member?.is_superuser) activeRoles.push("Superuser");

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {member?.salutation} {member?.first_name} {member?.last_name}
          </h1>
          <p className="text-slate-500">{member?.member_no}</p>
        </div>
        <div className="flex gap-2">
           {activeRoles.map(role => (
             <Badge key={role} variant="outline" className="bg-slate-100">{role}</Badge>
           ))}
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 text-[var(--accent)] mb-1">
            <Shield className="h-5 w-5" />
            <CardTitle>System Roles</CardTitle>
          </div>
          <CardDescription>
            Manage the administrative and system roles assigned to this member.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Button onClick={() => setRoleModal(true)} className="bg-[var(--accent)] hover:bg-[#0f2c4a]">
             Update Member Roles
           </Button>
        </CardContent>
      </Card>

      <UpdateMemberRole
        isOpen={roleModal}
        onClose={() => setRoleModal(false)}
        refetchMember={handleRefetchAll}
        member={member}
      />
    </div>
  );
}
