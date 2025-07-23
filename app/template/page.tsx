"use client";
import { alovaInstance } from "@/app/api";
import TemplateTable from "@/app/components/template-table";
import type { Template } from "@/app/interface";
import { PlusIcon } from "@heroicons/react/16/solid";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { SearchIcon } from "@heroui/shared-icons";
import { useRequest } from "alova/client";
import Link from "next/link";

function TemplatePage() {
	const { data } = useRequest(
		alovaInstance.Get<{
			templates: Template[];
		}>("/templates/search"),
		{
			initialData: {
				templates: [],
			},
		},
	);
	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between">
				<Input
					placeholder="搜索"
					startContent={<SearchIcon />}
					className="w-80"
					isDisabled
				/>
				<Button
					as={Link}
					color="primary"
					href="/duty/create"
					variant="solid"
					isDisabled
				>
					<PlusIcon />
					新建
				</Button>
			</div>
			<TemplateTable data={data.templates} />
		</div>
	);
}
export default TemplatePage;
