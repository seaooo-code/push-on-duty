"use client";
import { alovaInstance } from "@/app/api";
import DutyForm from "@/app/components/duty-form";
import type { DutyWithUsers } from "@/app/interface";
import type { dutiesTable, usersTable } from "@/drizzle/schema";
import { useRequest } from "alova/client";
import { useParams } from "next/navigation";

type IUser = typeof usersTable.$inferSelect;
type IDutySelect = typeof dutiesTable.$inferSelect;

const DutyDetail = () => {
	const params = useParams();

	const { data: dutyRes } = useRequest(
		alovaInstance.Get<{
			data: DutyWithUsers;
		}>(`/duties/${params.id}`, {
			hitSource: ["updateDuty"],
		}),
	);
	return dutyRes?.data ? <DutyForm duty={dutyRes?.data} /> : null;
};
export default DutyDetail;
