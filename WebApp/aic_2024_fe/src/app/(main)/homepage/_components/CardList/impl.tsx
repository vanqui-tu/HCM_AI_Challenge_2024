'use client';

import { ImageCard, Loader, Typography } from '@components';
import { ImageCardProps } from '@components/ImageCard/types';
import { Empty, Tabs } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AutoSizer, Grid, GridCellProps } from 'react-virtualized';
import './styles.scss';
import { CardListProps } from './types';

export function CardList({ loading, items, hasSearched }: CardListProps) {
	const cardlistRef = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState<number>(0);
	const [height, setHeight] = useState<number>(0);
	const [loadingItems, setLoadingItems] = useState(false);
	const isLoading = useMemo(() => loading || loadingItems, [loading, loadingItems]);
	const [currentDisplayType, setCurrentDisplayType] = useState('large');

	const cardDisplayItems = useMemo(() => [
		{
			label: `Large`,
			key: 'large',
		},
		{
			label: `Medium`,
			key: 'medium',
		},
	], []);

	const gap = 8; // Gap between grid items

	const columnCount = useMemo(() => currentDisplayType === 'large' ? 2 : 3, [currentDisplayType]);
	const columnWidth = useMemo(() => (width - gap * (columnCount - 1)) / columnCount, [width, columnCount]);
	const rowHeight = useMemo(() => columnWidth * 2 / 3 + gap, [columnWidth, gap]);
	const rowCount = useMemo(() => Math.ceil(items.length / columnCount), [columnCount, items.length]);

	const cellRenderer = useCallback(
		({ columnIndex, key, rowIndex, style }: GridCellProps) => {
			const index = rowIndex * columnCount + columnIndex;
			if (index >= items.length) return null;
			const item = items[index];

			return (
				<div
					key={`${item.id}-${key}`}  // Ensure the key is unique
					style={{
						...style,
						left: style.left as number + columnIndex * gap,
						top: style.top as number + rowIndex * gap,
						width: Math.floor(columnWidth - 16),
						height: rowHeight - gap,
						boxSizing: 'border-box',
					}}
				>
					<ImageCard
						type={currentDisplayType as ImageCardProps['type']}
						{...item}
						style={{
							width: '100%',
							height: '100%',
							boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',  // Example box-shadow
						}}
					/>
				</div>
			);
		},
		[columnCount, currentDisplayType, items, rowHeight, columnWidth, gap]
	);
	// Function to update the width state with the current width of the element
	const updateSize = useCallback(() => {
		if (cardlistRef.current) {
			setWidth(cardlistRef.current.offsetWidth);
			setHeight(cardlistRef.current.offsetHeight);
		}
	}, []);

	useEffect(() => {
		// Update the width when the component mounts
		updateSize();

		// Update the width whenever the window is resized
		window.addEventListener('resize', updateSize);

		// Cleanup the event listener on component unmount
		return () => {
			window.removeEventListener('resize', updateSize);
		};
	}, [updateSize, hasSearched]);

	console.log('height: ', height)
	return (
		<div className='card-list' ref={cardlistRef}>
			{/* {
				hasSearched &&
				<Statistic title="Items found: " value={items.length} loading={isLoading} />
			} */}

			{
				hasSearched
				&& <Tabs
					className='card-list-display-style'
					items={cardDisplayItems}
					activeKey={currentDisplayType}
					onChange={setCurrentDisplayType}
					tabPosition='right'
				/>
			}

			{
				isLoading ? (
					<Loader className='card-list__loading' />
				) : (
					items.length === 0 ? (
						<Empty
							style={{
								justifyContent: 'center',
								alignSelf: 'center'
							}}
							image="/png/golang_80.png"
							imageStyle={{ height: 60 }}
							description={
								<Typography>
									{hasSearched ? 'No results found.' : 'Please enter a search query.'}
								</Typography>
							}
						>
						</Empty>
					) :
						<>
							<AutoSizer disableHeight >
								{({ width }) => (
									<Grid
										cellRenderer={cellRenderer}
										columnCount={columnCount}
										columnWidth={columnWidth}
										rowCount={rowCount}
										rowHeight={rowHeight}
										width={width}
										height={height}
										overscanRowCount={3}
									/>
								)}
							</AutoSizer>
						</>
				)
			}
		</div>
	);
}
