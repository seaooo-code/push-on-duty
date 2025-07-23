import type { usersTable } from "@/drizzle/schema";
import {
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@heroui/badge";
import { Card, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image";
import { CheckIcon, CloseIcon } from "@heroui/shared-icons";
import type React from "react";

interface SortableItemProps {
	user: typeof usersTable.$inferSelect;
	handleDelete: (id: string) => void;
}
function SortableItem({ user, handleDelete }: SortableItemProps) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: user.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div className="group relative">
			<CloseIcon
				onClick={(event) => handleDelete(user.id)}
				color="black"
				className="absolute right-[-10px] top-[-10px] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
			/>
			<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
				<Card
					isFooterBlurred
					className="border-none w-20 h-20 group overflow-auto"
					radius="lg"
				>
					<Image
						alt="Woman listing to music"
						className="object-cover"
						src={user.avatar}
					/>
					<CardFooter className="before:bg-white/10 border-white/20 border-1 overflow-hidden py-0 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
						<p className="text-tiny text-white/80 text-ellipsis whitespace-nowrap">
							{user.name}
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}

interface UserCardListProps {
	currentIndex: number;
	users: (typeof usersTable.$inferSelect)[];
	setUsers: React.Dispatch<
		React.SetStateAction<(typeof usersTable.$inferSelect)[]>
	>;
}
export default function UserCardList({
	users,
	setUsers,
	currentIndex,
}: UserCardListProps) {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);
	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;

		if (active.id !== over?.id) {
			setUsers((users) => {
				const oldIndex = users.findIndex((item) => item.id === active.id);
				const newIndex = users.findIndex((item) => item.id === over?.id);

				return arrayMove(users, oldIndex, newIndex);
			});
		}
	}

	const handleDelete = (id: string) => {
		setUsers((users) => users.filter((user) => user.id !== id));
	};

	return (
		<DndContext
			sensors={sensors}
			modifiers={[restrictToWindowEdges]}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={users || []}>
				<div className="flex flex-wrap gap-4">
					{users?.map((user, index) => (
						<Badge
							color="success"
							content={index === currentIndex ? <CheckIcon /> : null}
							placement="bottom-right"
							key={user.id}
						>
							<SortableItem
								key={user.id}
								user={user}
								handleDelete={handleDelete}
							/>
						</Badge>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}
