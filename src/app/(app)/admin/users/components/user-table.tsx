"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { UserForManagement } from "@/lib/definitions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface UserTableProps {
  users: UserForManagement[];
}

const ITEMS_PER_PAGE = 10;

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
};

export default function UserTable({ users: initialUsers }: UserTableProps) {
  const [users, setUsers] = useState<UserForManagement[]>(initialUsers);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return users.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, users]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NgÆ°á»i dÃ¹ng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>SÄT</TableHead>
              <TableHead className="text-center">Sá»‘ Ä‘Æ¡n</TableHead>
              <TableHead className="text-right">Lá»£i nhuáº­n</TableHead>
              <TableHead>Tráº¡ng thÃ¡i</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                        alt={user.name}
                      />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{user.name}</div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell className="text-center">{user.orderCount}</TableCell>
                <TableCell className="text-right">{formatCurrency(user.profit)}</TableCell>
                <TableCell>
                    <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                        {user.status === 'Active' ? 'Hoáº¡t Ä‘á»™ng' : 'Bá»‹ cáº¥m'}
                    </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(currentPage - 1);
                            }}
                            className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                        />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <PaginationItem key={page}>
                            <PaginationLink
                                href="#"
                                size="icon"
                                isActive={currentPage === page}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(page);
                                }}
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(currentPage + 1);
                            }}
                            className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
      )}
    </>
  );
}
