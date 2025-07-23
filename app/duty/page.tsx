"use client";
import { alovaInstance } from "@/app/api";
import DutyTable from "@/app/components/duty-table";
import type { DutyWithCurrentUser } from "@/app/interface";
import { GlobalStore } from "@/app/store";
import { PlusIcon } from "@heroicons/react/16/solid";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { SearchIcon } from "@heroui/shared-icons";
import { actionDelegationMiddleware, useWatcher } from "alova/client";
import { useState } from "react";
import { useSnapshot } from "valtio/react";

function DutyPage() {
	const [searchInput, setSearchInput] = useState<string>("");
	const snap = useSnapshot(GlobalStore);

	const { data: dutiesRes, loading } = useWatcher(
		alovaInstance.Get<{
			duties: Array<DutyWithCurrentUser>;
		}>("/duties/search", {
			params: {
				keyword: searchInput,
			},
			hitSource: [
				"createDuty",
				"deleteDuty",
				"runDuty",
				"switchDuty",
				"updateDuty",
			],
		}),
		[searchInput],
		{
			immediate: true,
			initialData: [],
			debounce: 500,
			middleware: actionDelegationMiddleware("searchDuty"),
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
					as={Link}
					color="primary"
					href="/duty/create"
					variant="solid"
					isDisabled={!snap.isLogin}
				>
					<PlusIcon />
					新建
				</Button>
			</div>
			<DutyTable data={dutiesRes.duties || []} loading={loading} />
		</div>
	);
}

export default DutyPage;
