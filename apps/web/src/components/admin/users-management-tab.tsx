"use client";

import { api } from "@school-learn/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
	Filter,
	GraduationCap,
	MoreHorizontal,
	Search,
	Shield,
	User,
	UserCheck,
	UserX,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function UsersManagementTab() {
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState<
		"all" | "user" | "admin" | "instructor"
	>("all");

	const usersResult = useQuery(api.users.getAllUsers, {
		search: searchQuery || undefined,
		role: roleFilter !== "all" ? roleFilter : undefined,
		limit: 50,
		offset: 0,
	});

	const updateUserRole = useMutation(api.users.updateUserRole);
	const suspendUser = useMutation(api.users.suspendUser);

	const users = usersResult?.users || [];

	const handleRoleChange = async (
		userId: string,
		newRole: "user" | "admin" | "instructor",
	) => {
		try {
			await updateUserRole({ userId: userId as any, role: newRole });
			toast.success(`User role updated to ${newRole}`);
		} catch (error) {
			toast.error("Failed to update user role");
		}
	};

	const handleSuspendUser = async (userId: string, suspended: boolean) => {
		try {
			await suspendUser({
				userId: userId as any,
				suspended,
				reason: suspended ? "Suspended by admin" : undefined,
			});
			toast.success(suspended ? "User suspended" : "User unsuspended");
		} catch (error) {
			toast.error("Failed to update user status");
		}
	};

	const getRoleIcon = (role: string) => {
		switch (role) {
			case "admin":
				return <Shield className="h-4 w-4" />;
			case "instructor":
				return <GraduationCap className="h-4 w-4" />;
			default:
				return <User className="h-4 w-4" />;
		}
	};

	const getRoleBadgeVariant = (role: string) => {
		switch (role) {
			case "admin":
				return "destructive";
			case "instructor":
				return "default";
			default:
				return "secondary";
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UserCheck className="h-5 w-5" />
						User Management
					</CardTitle>
					<CardDescription>
						Manage user accounts, roles, and permissions
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Filters */}
					<div className="mb-6 flex flex-col gap-4 sm:flex-row">
						<div className="relative flex-1">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search users by name or email..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9"
							/>
						</div>
						<Select
							value={roleFilter}
							onValueChange={(value: "all" | "user" | "admin" | "instructor") =>
								setRoleFilter(value)
							}
						>
							<SelectTrigger className="w-full sm:w-[180px]">
								<Filter className="mr-2 h-4 w-4" />
								<SelectValue placeholder="Filter by role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Roles</SelectItem>
								<SelectItem value="user">Users</SelectItem>
								<SelectItem value="instructor">Instructors</SelectItem>
								<SelectItem value="admin">Admins</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Users Table */}
					<div className="rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>User</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Joined</TableHead>
									<TableHead>Last Active</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.map((user) => (
									<TableRow key={user._id}>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8">
													<AvatarImage
														src={user.imageUrl || "/placeholder.svg"}
													/>
													<AvatarFallback>
														{user.name.charAt(0).toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium">{user.name}</p>
													<p className="text-muted-foreground text-sm">
														{user.email}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant={getRoleBadgeVariant(user.role)}
												className="gap-1"
											>
												{getRoleIcon(user.role)}
												{user.role}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge
												variant={user.suspended ? "destructive" : "default"}
											>
												{user.suspended ? "Suspended" : "Active"}
											</Badge>
										</TableCell>
										<TableCell>
											{new Date(user.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell>
											{new Date(user.updatedAt).toLocaleDateString()}
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" className="h-8 w-8 p-0">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuLabel>Actions</DropdownMenuLabel>
													<DropdownMenuSeparator />

													<DropdownMenuItem
														onClick={() => handleRoleChange(user._id, "user")}
														disabled={user.role === "user"}
													>
														<User className="mr-2 h-4 w-4" />
														Make User
													</DropdownMenuItem>

													<DropdownMenuItem
														onClick={() =>
															handleRoleChange(user._id, "instructor")
														}
														disabled={user.role === "instructor"}
													>
														<GraduationCap className="mr-2 h-4 w-4" />
														Make Instructor
													</DropdownMenuItem>

													<DropdownMenuItem
														onClick={() => handleRoleChange(user._id, "admin")}
														disabled={user.role === "admin"}
													>
														<Shield className="mr-2 h-4 w-4" />
														Make Admin
													</DropdownMenuItem>

													<DropdownMenuSeparator />

													<DropdownMenuItem
														onClick={() =>
															handleSuspendUser(user._id, !user.suspended)
														}
														className={
															user.suspended ? "text-green-600" : "text-red-600"
														}
													>
														{user.suspended ? (
															<>
																<UserCheck className="mr-2 h-4 w-4" />
																Unsuspend User
															</>
														) : (
															<>
																<UserX className="mr-2 h-4 w-4" />
																Suspend User
															</>
														)}
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{users.length === 0 && (
						<div className="py-8 text-center">
							<p className="text-muted-foreground">No users found</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
