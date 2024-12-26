"use client";

import { Switch } from "@/components/ui/switch";
import React, { use, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { updateDefaultAccount } from "@/actions/accounts";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";

const AccountCard = ({ account }) => {
  const { name, balance, type, id, isDefault } = account;

  const {
    loading: updateAccountLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (e) => {
    e.preventDefault();
    if (isDefault) {
      toast.warning("Account is already default");
      return;
    }

    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount && !updateAccountLoading) {
      toast.success("Account updated successfully");
    }
  }, [updatedAccount, updateAccountLoading]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update account");
    }
  }, [error]);

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group relative">
      <Link href={`/account/${id}`}>
        <CardHeader className="flex flex-row intem-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium capitalize">
            {name}
          </CardTitle>
          <Switch
            checked={isDefault}
            onClick={handleDefaultChange}
            disabled={updateAccountLoading}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${parseFloat(balance).toFixed(2)}
          </div>
          <p className="text-muted-foreground text-xs">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" /> Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" /> Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default AccountCard;
