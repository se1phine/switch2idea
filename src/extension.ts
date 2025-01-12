import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as os from 'os';

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
				ideaPath = 'idea';
			} else if (os.platform() === 'win32') {
				ideaPath = 'C:\\Program Files\\JetBrains\\IntelliJ IDEA\\bin\\idea64.exe';
			} else {
				ideaPath = 'idea';
			}
		}

		let command: string;
		if (os.platform() === 'darwin') {
			const ideaUrl = `idea://open?file=${encodeURIComponent(filePath)}&line=${line}&column=${column}`;
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
				ideaPath = 'idea';
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
