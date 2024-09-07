'use client';

import { InboxOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { Typography } from '@components';
import { useNotif } from '@contexts';
import { FloatButton, GetProp, Modal, Select, SelectProps, Tooltip, Upload, UploadFile, UploadProps } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import './styles.scss';

const { Dragger } = Upload;


interface UploadedFile {
	name: string;
	content: string;
}
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

export function QualifyingRound() {
	const { open } = useNotif();
	const [openUpload, setOpenUpload] = useState(false);
	const [files, setFiles] = useState<UploadFile[]>([]);
	const [fileContents, setFileContents] = useState<UploadedFile[]>([]);
	const [selectedFileContent, setSelectedFileContent] = useState<string>('null');

	const uploadProps: UploadProps = useMemo(() => ({
		name: 'file',
		multiple: true,
		accept: ".txt",
		maxCount: 100,
		beforeUpload: (file, fileList) => {
			setFiles([...fileList]);
			return false;
		},
		onDrop(e) {
			console.log('Dropped files', e.dataTransfer.files);
		},
	}), []);

	const options: SelectProps['options'] = useMemo(() => files.map((f) => ({
		label: f.name,
		value: f.name,
	})), [files]);

	const onChangeSelectedOption = useCallback((value: string) => {
		const filters = fileContents.filter(o => o.name === value)
		if (filters.length > 0) {
			setSelectedFileContent(filters[0].content);
		}
	}, [fileContents]);

	useEffect(() => {
		files.forEach(file => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				setFileContents((prev) => [...prev, { name: file.name, content }]);
			};
			reader.readAsText(file as FileType);
		});
	}, [files]);

	useEffect(() => {
		if (fileContents.length > 0) {
			setSelectedFileContent(fileContents[0].content);
		}
	}, [fileContents]);

	const onCopyText = useCallback(() => {
		navigator.clipboard.writeText(selectedFileContent)
			.then(() => {
				open({
					type: 'success',
					message: `Copy requirement successfully.`
				});
			})
			.catch((err) => {
				console.error('Failed to copy text: ', err);
				open({
					type: 'error',
					message: `Copy requirement failed.`
				});
			});
	}, [open, selectedFileContent]);

	const handleOk = useCallback(() => {
		setOpenUpload(false);
	}, []);

	const handleCancel = useCallback(() => {
		setOpenUpload(false);
	}, []);

	return (
		<>
			<div className="qualifying-round">
				{
					files.length > 0 &&
					<>

						<div className="qualifying-round__content">
							<Typography type='paragraph' className="qualifying-round__content__text">
								{selectedFileContent}
							</Typography>
							<SaveOutlined onClick={onCopyText} />
						</div>

					</>
				}
			</div>
			{
				files.length > 0 &&
				<Select
					onChange={onChangeSelectedOption}
					defaultValue={files[0].name}
					style={{
						position: 'fixed',
						top: 140,
						right: 120,
					}}
					options={options}
				/>
			}

			<Modal open={openUpload} cancelText={false} okText={false} onCancel={handleCancel} onOk={handleOk}>
				<Dragger {...uploadProps}>
					<p className="ant-upload-drag-icon">
						<InboxOutlined />
					</p>
					<p className="ant-upload-text">Click or drag requirement(s)  (*.txt)</p>
				</Dragger>
			</Modal>

			<Tooltip title="Upload requirements (*.txt)">
				<FloatButton
					onClick={() => setOpenUpload(true)}
					icon={<UploadOutlined />}
					type="primary"
					style={{ insetInlineEnd: 24 }}
				/>
			</Tooltip>
		</>
	);
}
