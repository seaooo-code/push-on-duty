// 用户相关类型
import type { dutiesTable, templatesTable, usersTable } from "@/drizzle/schema";

export type User = typeof usersTable.$inferSelect;
export type UserInsert = typeof usersTable.$inferInsert;

// 职责相关类型
export type Duty = typeof dutiesTable.$inferSelect;
export type DutyInsert = typeof dutiesTable.$inferInsert;

export type Template = typeof templatesTable.$inferSelect;

export interface DutyWithUsers extends Duty {
	users: User[];
}

export interface DutyWithCurrentUser extends Duty {
	currentUser: User;
}
