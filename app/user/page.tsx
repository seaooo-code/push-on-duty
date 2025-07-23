"use client";
import { alovaInstance } from "@/app/api";
import AddUserModal from "@/app/components/add-user-modal";
import UserTable from "@/app/components/user-table";
import type { User } from "@/app/interface";
import { GlobalStore } from "@/app/store";
import { PlusIcon } from "@heroicons/react/16/solid";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useDisclosure } from "@heroui/modal";
import { SearchIcon } from "@heroui/shared-icons";
import { actionDelegationMiddleware, useWatcher } from "alova/client";
import { useState } from "react";
import { useSnapshot } from "valtio/react";

function UserPage() {
	const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
	const [searchInput, setSearchInput] = useState<string>("");
	const snap = useSnapshot(GlobalStore);

	const { data: usersRes, loading } = useWatcher(
		alovaInstance.Get<{
			users: Array<User>;
		}>("/users/search", {
			params: {
				keyword: searchInput,
			},
			hitSource: ["createUser", "deleteUser"],
		}),
		[searchInput],
		{
			immediate: true,
			initialData: [],
			debounce: 500,
			middleware: actionDelegationMiddleware("searchUser"),
		},
	);

	return (
		<div className="w-10/12 flex flex-col gap-4">
			<div className="flex justify-between">
				<Input
					placeholder="搜索"
					startContent={<SearchIcon />}
					className="w-80"
					value={searchInput}
					onValueChange={setSearchInput}
				/>
				<Button
					color="primary"
					onPress={onOpen}
					variant="solid"
					isDisabled={!snap.isLogin}
				>
					<PlusIcon />
					新建
				</Button>
			</div>
			<UserTable users={usersRes?.users} loading={loading} />
			<AddUserModal
				isOpen={isOpen}
				onClose={onClose}
				backdrop="blur"
				placement="top-center"
				onOpenChange={onOpenChange}
			/>
		</div>
	);
}
export default UserPage;
