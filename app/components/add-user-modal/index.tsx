"use client";
import { alovaInstance } from "@/app/api";
import type { User as IUser } from "@/app/interface";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button } from "@heroui/button";
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	type ModalProps,
} from "@heroui/modal";
import { User, addToast } from "@heroui/react";
import type { Key } from "@react-types/shared";
import { accessAction, useRequest, useWatcher } from "alova/client";
import { useState } from "react";

type AddUserModalProps = Omit<ModalProps, "children">;

type ISearch = {
	selectedKey: Key | null;
	inputValue: string;
};
type IUserListRes = {
	users: IUser[];
};

function AddUserModal(props: AddUserModalProps) {
	const [search, setSearch] = useState<ISearch>({
		selectedKey: "",
		inputValue: "",
	});
	const [selectedUser, setSelectedUser] = useState<IUser>();

	const userList = useWatcher(
		() =>
			alovaInstance.Get<IUserListRes>(
				`/feishu/search?query=${search.inputValue}`,
			),
		[search.inputValue],
		{
			initialData: [],
			debounce: 500,
		},
	);

	const { send: createUser, loading: isCreating } = useRequest(
		alovaInstance.Post("/users/create", selectedUser, {
			name: "createUser",
		}),
		{
			immediate: false,
		},
	).onSuccess(() => {
		accessAction("searchUser", (delegatedActions) => {
			delegatedActions.send();
		});
		setSearch({
			selectedKey: "",
			inputValue: "",
		});
		setSelectedUser(undefined);
		addToast({
			title: "添加人员成功",
			color: "success",
		});
		props.onClose?.();
	});

	const handleOnSelect = (key: Key | null) => {
		const selectedItem = userList.data?.users?.find((item) => item.id === key);
		selectedItem &&
			setSearch({
				inputValue: selectedItem.name,
				selectedKey: key,
			});
		setSelectedUser(selectedItem);
	};

	return (
		<Modal {...props}>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">添加人员</ModalHeader>
						<ModalBody>
							<Autocomplete
								label="人员"
								placeholder="请输入搜索"
								inputValue={search.inputValue}
								onInputChange={(value) =>
									setSearch({
										...search,
										inputValue: value,
									})
								}
								listboxProps={{ emptyContent: "暂无数据" }}
								selectedKey={search.selectedKey}
								onSelectionChange={handleOnSelect}
								onClear={() => setSelectedUser(undefined)}
								isLoading={userList.loading}
								items={userList.data?.users || []}
							>
								{(item) => (
									<AutocompleteItem key={item.id} textValue={item.name}>
										<User
											name={item.name}
											avatarProps={{
												src: item.avatar,
												size: "sm",
											}}
											description={item.email}
										/>
									</AutocompleteItem>
								)}
							</Autocomplete>
						</ModalBody>
						<ModalFooter>
							<Button onPress={onClose}>取消</Button>
							<Button
								isLoading={isCreating}
								color="primary"
								onPress={createUser}
								isDisabled={!selectedUser}
							>
								保存
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
}
export default AddUserModal;
