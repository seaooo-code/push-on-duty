"use client";
import { alovaInstance } from "@/app/api";
import { GlobalStore } from "@/app/store";
import {
	ArrowLeftStartOnRectangleIcon,
	CalendarDaysIcon,
	DocumentIcon,
	HomeIcon,
	UsersIcon,
} from "@heroicons/react/16/solid";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Skeleton, User, addToast } from "@heroui/react";
import { useRequest } from "alova/client";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSnapshot } from "valtio/react";

const Scopes = [
	"contact:contact.base:readonly",
	"contact:user.base:readonly",
	"contact:user.email:readonly",
	"contact:user:search",
];

type IUserInfo = {
	code: number;
	msg: string;
	data: {
		open_id: string;
		name: string;
		avatar_url: string;
		email: string;
	};
};

export default function Header() {
	const snap = useSnapshot(GlobalStore);
	const path = usePathname();
	const { loading, send } = useRequest(
		alovaInstance.Get<IUserInfo>("/feishu/user-info"),
		{
			initialData: {},
			immediate: false,
		},
	).onSuccess((res) => {
		const user = res.data.data;
		if (user) {
			GlobalStore.loginUser = {
				id: user.open_id,
				name: user.name,
				avatarUrl: user.avatar_url,
				email: user.email,
			};
			GlobalStore.isLogin = true;
		}
	});
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (localStorage.getItem("access_token")) {
			send();
		}
	}, []);

	const handleLogin = () => {
		window.location.href = `https://open.f.mioffice.cn/open-apis/authen/v1/authorize?app_id=cli_a8aff646bc7a1063&redirect_uri=${encodeURIComponent(location.origin)}&scope=${encodeURIComponent(Scopes.join(" "))}`;
	};

	const handleLogout = () => {
		localStorage.clear();
		location.reload();
	};
	return (
		<Navbar
			maxWidth="full"
			classNames={{
				item: [
					"flex",
					"relative",
					"h-full",
					"items-center",
					"data-[active=true]:after:content-['']",
					"data-[active=true]:after:absolute",
					"data-[active=true]:after:bottom-0",
					"data-[active=true]:after:left-0",
					"data-[active=true]:after:right-0",
					"data-[active=true]:after:h-[2px]",
					"data-[active=true]:after:rounded-[2px]",
					"data-[active=true]:after:bg-primary",
				],
			}}
		>
			<NavbarBrand>
				<Link className="font-bold text-xl" href="/" color="foreground">
					值班推送
				</Link>
			</NavbarBrand>
			<NavbarContent className="hidden sm:flex gap-8" justify="center">
				<NavbarItem isActive={path === "/"}>
					<Link
						className="flex items-center gap-1"
						href="/"
						as={NextLink}
						color={path === "/" ? "primary" : "foreground"}
					>
						<HomeIcon className="size-5" />
						首页
					</Link>
				</NavbarItem>
				<NavbarItem isActive={path.startsWith("/duty")}>
					<Link
						className="flex items-center gap-1"
						href="/duty"
						as={NextLink}
						color={path.startsWith("/duty") ? "primary" : "foreground"}
					>
						<CalendarDaysIcon className="size-5" />
						计划
					</Link>
				</NavbarItem>
				<NavbarItem isActive={path.startsWith("/user")}>
					<Link
						className="flex items-center gap-1"
						href="/user"
						as={NextLink}
						color={path.startsWith("/user") ? "primary" : "foreground"}
					>
						<UsersIcon className="size-5" />
						人员
					</Link>
				</NavbarItem>
				<NavbarItem isActive={path.startsWith("/template")}>
					<Link
						className="flex items-center gap-1"
						href="/template"
						as={NextLink}
						color={path.startsWith("/template") ? "primary" : "foreground"}
					>
						<DocumentIcon className="size-5" />
						模板
					</Link>
				</NavbarItem>
			</NavbarContent>
			<NavbarContent justify="end">
				{snap.loginUser ? (
					<div className="flex items-center gap-1">
						{loading ? (
							<Skeleton className="flex rounded-full w-8 h-8" />
						) : (
							<User
								name={""}
								avatarProps={{
									src: snap.loginUser?.avatarUrl,
									size: "sm",
									isBordered: true,
								}}
							/>
						)}

						<Button
							variant="light"
							onPress={handleLogout}
							color="danger"
							startContent={
								<ArrowLeftStartOnRectangleIcon className="size-5" />
							}
							isIconOnly
						/>
					</div>
				) : (
					<Button variant="solid" color="primary" onPress={handleLogin}>
						登录
					</Button>
				)}
			</NavbarContent>
		</Navbar>
	);
}
