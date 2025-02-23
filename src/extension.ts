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

	// Iterate through all possible IDEA installation paths and return the first existing path
	for (const path of commonPaths) {
		if (fs.existsSync(path)) {
			return path;
		}
	}
	// If no paths exist, return the default APP name
	return 'IntelliJ IDEA';
}

function executeCommand(command: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const childProcess = exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error('Error executing command:', error);
				console.error('Stderr:', stderr);
				reject(error);
				return;
			}
			if (stdout) {
				console.log('Command output:', stdout);
			}
			if (stderr) {
				console.log('Command stderr:', stderr);
			}
			resolve();
		});

		// Add error handling
		childProcess.on('error', (error: NodeJS.ErrnoException) => {
			if (error.code === 'EPIPE') {
				console.log('Pipe communication disconnected, but this may not affect IDEA startup');
				resolve(); // Continue execution as IDEA may have started normally
			} else {
				reject(error);
			}
		});
	});
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
			// If IDEA is already open, using the 'idea' command will show two IDEA icons in the dock temporarily
			// Using the 'open' command instead will prevent this issue
			command = `open -a "${ideaPath}" "${ideaUrl}"`;
		} else {
			command = `"${ideaPath}" --line ${line} --column ${column} "${filePath}"`;
		}

		console.log('Executing command:', command);

		try {
			await executeCommand(command);
		} catch (error) {
			const err = error as Error;
			vscode.window.showErrorMessage(`Failed to open IDEA: ${err.message}`);
		}
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

		try {
			await executeCommand(command);
		} catch (error) {
			const err = error as Error;
			vscode.window.showErrorMessage(`Failed to open project in IDEA: ${err.message}`);
		}
	});

	context.subscriptions.push(openFileDisposable);
	context.subscriptions.push(openProjectDisposable);
}

export function deactivate() {}
