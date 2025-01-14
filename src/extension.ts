import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as os from 'os';
import * as fs from 'fs';

function getMacIdeaPath(): string {
	const commonPaths = [
		'/Applications/IDEA.app',
		'/Applications/IntelliJ IDEA.app',
		'/Applications/IntelliJ IDEA CE.app',
		'/Applications/IntelliJ IDEA Ultimate.app',
		'/Applications/IntelliJ IDEA Community Edition.app', 
		`${os.homedir()}/Applications/IDEA.app`,
		`${os.homedir()}/Applications/IntelliJ IDEA.app`,
		`${os.homedir()}/Applications/IntelliJ IDEA CE.app`,
		`${os.homedir()}/Applications/IntelliJ IDEA Ultimate.app`,
		`${os.homedir()}/Applications/IntelliJ IDEA Community Edition.app`,
	];

	// 遍历所有可能的 IDEA 安装路径，找到第一个存在的路径
	for (const path of commonPaths) {
		if (fs.existsSync(path)) {
			return path;
		}
	}
	// 如果所有路径都不存在，则返回默认的 APP 名称
	return 'IntelliJ IDEA';
}

export function activate(context: vscode.ExtensionContext) {

	console.log('Switch2IDEA is now active!');

	let openFileDisposable = vscode.commands.registerCommand('Switch2IDEA.openFileInIDEA', async (uri?: vscode.Uri) => {
		let filePath: string;
		let line = 1;
		let column = 1;

		if (uri) {
			filePath = uri.fsPath;
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document.uri.fsPath === filePath) {
				line = editor.selection.active.line + 1;
				column = editor.selection.active.character;
			}
		} else {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('No active editor!');
				return;
			}
			filePath = editor.document.uri.fsPath;
			line = editor.selection.active.line + 1;
			column = editor.selection.active.character;
		}

		const config = vscode.workspace.getConfiguration('switch2idea');
		let ideaPath = config.get<string>('ideaPath');

		if (!ideaPath) {
			if (os.platform() === 'darwin') {
				ideaPath = getMacIdeaPath();
			} else if (os.platform() === 'win32') {
				ideaPath = 'C:\\Program Files\\JetBrains\\IntelliJ IDEA\\bin\\idea64.exe';
			} else {
				ideaPath = 'idea';
			}
		}

		let command: string;
		if (os.platform() === 'darwin') {
			const ideaUrl = `idea://open?file=${encodeURIComponent(filePath)}&line=${line}&column=${column}`;
			// 如果 IDEA 已经打开，使用 idea 命令打开会在 dock 栏中出现两个 IDEA 图标，短暂停留后第二个消失
			//所以使用 open 命令打开，不会出现这个问题
			command = `open -a "${ideaPath}" "${ideaUrl}"`;
		} else {
			command = `"${ideaPath}" --line ${line} --column ${column} "${filePath}"`;
		}

		console.log('Executing command:', command);

		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error('Error executing command:', error);
				console.error('Stderr:', stderr);
				vscode.window.showErrorMessage(`Failed to open IDEA: ${error.message}`);
				return;
			}
			if (stdout) {
				console.log('Command output:', stdout);
			}
			if (stderr) {
				console.log('Command stderr:', stderr);
			}
		});
	});

	let openProjectDisposable = vscode.commands.registerCommand('Switch2IDEA.openProjectInIDEA', async () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			vscode.window.showErrorMessage('No workspace folder is opened!');
			return;
		}

		const projectPath = workspaceFolders[0].uri.fsPath;

		const config = vscode.workspace.getConfiguration('switch2idea');
		let ideaPath = config.get<string>('ideaPath');

		if (!ideaPath) {
			if (os.platform() === 'darwin') {
				const macIdeaPath = getMacIdeaPath();
				ideaPath = macIdeaPath || 'IntelliJ IDEA';
			} else if (os.platform() === 'win32') {
				ideaPath = 'C:\\Program Files\\JetBrains\\IntelliJ IDEA\\bin\\idea64.exe';
			} else {
				ideaPath = 'idea';
			}
		}

		let command: string;
		if (os.platform() === 'darwin') {
			const ideaUrl = `idea://open?file=${encodeURIComponent(projectPath)}`;
			command = `open -a "${ideaPath}" "${ideaUrl}"`;
		} else {
			command = `"${ideaPath}" "${projectPath}"`;
		}

		console.log('Executing command:', command);

		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error('Error executing command:', error);
				console.error('Stderr:', stderr);
				vscode.window.showErrorMessage(`Failed to open project in IDEA: ${error.message}`);
				return;
			}
			if (stdout) {
				console.log('Command output:', stdout);
			}
			if (stderr) {
				console.log('Command stderr:', stderr);
			}
		});
	});

	context.subscriptions.push(openFileDisposable);
	context.subscriptions.push(openProjectDisposable);
}

export function deactivate() {}
