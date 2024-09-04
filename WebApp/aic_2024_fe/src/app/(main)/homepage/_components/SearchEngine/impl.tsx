'use client';
import { Typography } from '@components';
import { Badge, DatePicker, Flex, Form, Input, Tag } from 'antd';
import { Dayjs } from 'dayjs';
import { useCallback, useMemo, useRef, useState } from 'react';
import './styles.scss';
import { SearchEngineProps } from './types';
const { Search } = Input;

const { RangePicker } = DatePicker;

export function SearchEngine({
	search,
	setSearch,
	hasSearched,
	setHasSearched,
	setImageCards,
	setLoadingItems,
	handleFormSubmit
}: SearchEngineProps) {
	const itemRef = useRef<HTMLDivElement>(null);
	const tagsData = useMemo(() => ['Location', 'Time', 'Audio'], []);

	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	const handleKeyPress = useCallback(async (event: any) => {
		if (event.key === 'Enter') {
			// Prevent the default form submission behavior
			event.preventDefault();

			if (!hasSearched) {
				setHasSearched(true);
			}

			setLoadingItems(true);
			await handleFormSubmit();
			setLoadingItems(false);
		}
	}, [handleFormSubmit, hasSearched, setHasSearched, setLoadingItems]);

	const handleClickSuffix = useCallback((event: any) => {
		event.stopPropagation(); // Prevents the event from bubbling up to the parent
	}, []);

	const setSearchText = useCallback((value: string) => setSearch({
		...search,
		text: value
	}), [search, setSearch]);

	const setLocationText = useCallback((value: string) => setSearch({
		...search,
		location: value
	}), [search, setSearch]);

	const onChangeRangePicker = useCallback((dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => {
		setSearch({
			...search,
			dateRange: dateStrings[0] && dateStrings[1] ? {
				from: dateStrings[0],
				to: dateStrings[1]
			} : undefined
		});
	}, [search, setSearch]);

	const onChangeAudio = useCallback((value: string) => setSearch({
		...search,
		audio: value
	}), [search, setSearch]);

	const onChangeSelectTag = useCallback((tag: string, checked: boolean) => {
		const nextSelectedTags = checked
			? [...selectedTags, tag]
			: selectedTags.filter((t: any) => t !== tag);

		if (!checked) {
			if (tag === 'Location') {
				setLocationText('')
			}
			else if (tag === 'Time') {
				onChangeRangePicker(null, ['', '']);
			}
			else if (tag === 'Audio') {
				onChangeAudio('');
			}
		}
		setSelectedTags(nextSelectedTags);
	}, [onChangeAudio, onChangeRangePicker, selectedTags, setLocationText]);

	return (
		<Form style={{
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'flex-start'
		}}>
			<div className='search-engine' tabIndex={1} ref={itemRef} style={
				!hasSearched ? {
					marginBottom: 30
				} : {
					marginBottom: 10
				}
			}>
				<Search
					className='search-engine__input'
					value={search.text}
					onChange={e => setSearchText(e.target.value)}
					placeholder="Type something..."
					enterButton='Search'
					size="large"
					loading={false}
					onPressEnter={handleKeyPress}
					allowClear
					suffix={
						<Flex
							gap='middle'
							style={{
								zIndex: 100000
							}}
							onClick={handleClickSuffix}
							className='search-engine__input__suffix'
						>
							{
								selectedTags.includes('Location') &&
								<Badge.Ribbon
									text="Location"
									placement='end'
									className='search-engine__input__suffix__ribbon-location'
								>
									<Tag
										onClose={() => {
											onChangeSelectTag('Location', false);
										}}
										closable
									>
										<Input
											placeholder="Location"
											className='search-engine__input__suffix__location'
											onChange={e => setLocationText(e.target.value)}
										/>
									</Tag>
								</Badge.Ribbon>
							}

							{
								selectedTags.includes('Time') &&
								<Badge.Ribbon
									text="Time"
									placement='end'
									className='search-engine__input__suffix__ribbon-time'
								>
									<Tag onClose={() => {
										onChangeSelectTag('Time', false);
									}}
										closable>
										<RangePicker
											className='search-engine__input__suffix__range_picker'
											onChange={onChangeRangePicker}
											allowEmpty={[true, true]}
										/>
									</Tag>
								</Badge.Ribbon>
							}

							{
								selectedTags.includes('Audio') &&
								<Badge.Ribbon
									text="Audio"
									placement='end'
									className='search-engine__input__suffix__ribbon-location'
								>
									<Tag
										onClose={() => {
											onChangeSelectTag('Audio', false);
										}}
										closable
									>
										<Input
											placeholder="Audio"
											className='search-engine__input__suffix__location'
											onChange={e => onChangeAudio(e.target.value)}
										/>
									</Tag>
								</Badge.Ribbon>
							}
						</Flex>
					}
				/>

			</div>
			<div className='search-engine-tags' style={hasSearched ? {
				flexDirection: 'column',
				marginLeft: -100,
				position: 'fixed',
				top: 94,
				width: 100,
				padding: '0 16px 12px 0'
			} : {
			}}>
				{
					hasSearched &&
					<Typography type='title' level={5}>
						Filters
					</Typography>
				}
				{
					tagsData.map<React.ReactNode>((tag) => (
						<Tag.CheckableTag
							key={tag}
							checked={selectedTags.includes(tag)}
							onChange={(checked) => onChangeSelectTag(tag, checked)}
						>
							{tag}
						</Tag.CheckableTag>
					))
				}
			</div>
		</Form>
	);
}
