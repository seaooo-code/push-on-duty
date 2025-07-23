"use client";

import type { Template } from "@/app/interface";
import { Image } from "@heroui/image";
import {
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";

interface TemplateTableProps {
	data: Template[];
}
function TemplateTable({ data }: TemplateTableProps) {
	const rows = data.map((element) => (
		<TableRow key={element.name}>
			<TableCell>{element.name}</TableCell>
			<TableCell>
				<Image src={element.imageUrl} width={250} />
			</TableCell>
			<TableCell>{element.createAt}</TableCell>
			<TableCell>{element.updateAt}</TableCell>
		</TableRow>
	));
	return (
		<Table>
			<TableHeader>
				<TableColumn>姓名</TableColumn>
				<TableColumn>示意图</TableColumn>
				<TableColumn>创建时间</TableColumn>
				<TableColumn>更新时间</TableColumn>
			</TableHeader>
			<TableBody>{rows}</TableBody>
		</Table>
	);
}
export default TemplateTable;
