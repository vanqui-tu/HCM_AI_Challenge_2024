"use client";

import { SyncOutlined } from "@ant-design/icons";
import { ImageCardModel } from "@components/ImageCard/types";
import { socketServerBaseUrl } from "@configs";
import { useLoading, useNotif } from "@contexts";
import { FloatButton, theme } from "antd";
import { Content as AntdContent } from "antd/es/layout/layout";
import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { CardList } from "../CardList";
import { Footer } from "../Footer";
import { SearchEngine } from "../SearchEngine";
import { SearchValue } from "../SearchEngine/types";
import { QualifyingRound } from "./QualifyingRound";
import "./styles.scss";
import { ContentProps } from "./types";

export function Content({ children, ...props }: ContentProps) {
	const { setLoading } = useLoading();
	const [searchTime, setSearchTime] = useState("0");
	const { open } = useNotif();
	const {
		token: { colorBgContainer, borderRadiusLG },
	} = theme.useToken();

	const [search, setSearch] = useState<SearchValue>({
		text: "",
	});

	const [imageCards, setImageCards] = useState<ImageCardModel[]>([]);
	const [hasSearched, setHasSearched] = useState(false);
	const [loadingItems, setLoadingItems] = useState(false);

	const handleFormSubmit = useCallback(async () => {
		console.log("Form submitted with searchQuery:", search.text);
		console.log('Form submitted with firstSearchAudioQuery:', search.audio);

		try {
			setLoadingItems(true);
			var startTime = performance.now();
			const socket = io("http://localhost:5000");
			socket.emit("search", { searchQuery: search.text, searchAudioQuery: "" });

			socket.on("search_result", (data) => {
				if (Array.isArray(data.data)) {
					setImageCards(
						data.data.map((it: any) => ({
							id: `${it["v"]}-${it["f"]}`,
							thumbnail: `http://127.0.0.1:5000/static/${it["v"]}/${String(it["i"]).toString().padStart(4, '0')}.jpg`,
							title: `Video: ${it["v"]} - Frame: ${it["f"]}`,
							youtubeUrl: it["l"],
							videoName: it["v"],
							frame: it["f"],
							startTime: it["t"],
							// fps: it["f"]
						}))
					);
				}

				setLoadingItems(false);
			});

			socket.on("search_error", (error) => {
				open({
					type: 'error',
					message: error["error"]
				});
				setLoadingItems(false);
				console.error("Server error:", error);
			});

			var endTime = performance.now();
			console.log((endTime - startTime) / 1000);
			setSearchTime(((endTime - startTime) / 1000).toFixed(5));
		} catch (error) {
			console.error("Error:", error);
		}
	}, [open, search.audio, search.text]);

	// TODO: Tạo 1 connect qua giao thức socket
	useEffect(() => {
		setLoading(true);
		const socket = io(socketServerBaseUrl);
		socket.on("connect", () => {
			setLoading(false);
			open({
				type: "success",
				message: "Connected to server",
			});
		});

		return () => {
			socket.disconnect();
		};
	}, [open, setLoading]);

	return (
		<>
			<AntdContent className="content"  {...props} >
				<SearchEngine
					search={search}
					setSearch={setSearch}
					setImageCards={setImageCards}
					setLoadingItems={setLoadingItems}
					hasSearched={hasSearched}
					setHasSearched={setHasSearched}
					handleFormSubmit={handleFormSubmit}
				/>

				{/* Application's main content here*/}
				<div
					style={{
						flex: 1,
						background: colorBgContainer,
						padding: 24,
						borderRadius: borderRadiusLG,
						display: 'flex',
						flexDirection: 'column',
						marginBottom: hasSearched ? 10 : 0
					}}
				>
					<CardList
						loading={loadingItems}
						items={imageCards}
						hasSearched={hasSearched}
					/>
					{children}
				</div>

				{/* <FloatButton.Group shape="square" style={{ insetInlineEnd: 24 }}>
					<FloatButton icon={<SyncOutlined />} />
					<FloatButton.BackTop visibilityHeight={1024} />
				</FloatButton.Group> */}
			</AntdContent>

			<QualifyingRound />
			{!hasSearched && <Footer />}
		</>
	);
}
