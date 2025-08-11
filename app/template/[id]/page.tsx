"use client";
import { alovaInstance } from "@/app/api";
import TemplateForm from "@/app/components/template-form";
import type { Template } from "@/app/interface";
import { useRequest } from "alova/client";
import { useParams } from "next/navigation";

const TemplateDetail = () => {
	const params = useParams();

	const { data: templateRes } = useRequest(
		alovaInstance.Get<{
			data: Template;
		}>(`/templates/${params.id}`, {
			hitSource: ["updateTemplate"],
		}),
	);
	return templateRes?.data ? (
		<TemplateForm template={templateRes?.data} />
	) : null;
};
export default TemplateDetail;
