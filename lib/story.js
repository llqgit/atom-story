'use babel';

import CounterView from './counter-view';
import IndentView from './indent-view';
import { CompositeDisposable } from 'atom';

export default {

  counterView: null,
  indentView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.counterView = new CounterView(state.counterViewState);
    this.indentView = new IndentView(state.indentViewState);

    this.indentView.setToggleSwitchCallback(isIndent => {
      this.updateIndent();
    });

    this.modalPanel = atom.workspace.addModalPanel({
      item: this.counterView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'story:toggle': () => this.toggle(),
      'toCamel': () => this.snakeToCamel(),
      'toSnake': () => this.camelToSnake()
    }));

    var addDisposable = (editor, disposable) => {

    };

    // observeTextEditors 观察文字变化回调
    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      if (editor) {
        this.updateIndent(); // 更新首行缩进功能
        this.updateCount();
        this.subscriptions.add(editor.onDidChange(() => {
          this.updateCount();
          // this.updateIndent();
        }));
      } else {
        this.updateCount(0);
      }
    }));

    this.subscriptions.add(atom.workspace.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        this.updateCount();
      } else {
        this.updateCount(0);
      }
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.counterView.destroy();
    this.indentView.destroy();
    this.statusBarTile.destroy();
  },

  serialize() {
    return {
      counterViewState: this.counterView.serialize(),
      indentViewState: this.indentView.serialize()
    };
  },

  toggle() {
    console.log('Story was toggled!');
    this.updateCount();
    this.updateIndent();
  },

  // 检查后缀
  checkSuffix() {
    var suffix = ['story', 'md'];
    var editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
    	return false;
    }
    var title = editor.getTitle();
    for (var i in suffix) {
      if (title.match(`\.${suffix[i]}$`)) {
        return true;
      }
    }
    return false;
  },

  // 首行缩进
  updateIndent() {
    var editor = atom.workspace.getActiveTextEditor();
    if (this.checkSuffix()) {
      var indentSwitch = this.indentView.getIndentSwitch();
      var newText = '';
      var indent = '\u3000\u3000';
      var text = editor.getText();
      var lines = text.split('\n');
      if (indentSwitch) {
        for (var i in lines) {
          lines[i] = lines[i].replace(/^[\t\u3000\ ]*([^\u3000\s]+[\n\r]?)/g, indent + '$1');
        }
      } else {
        for (var i in lines) {
          lines[i] = lines[i].replace(/^[\t\u3000\ ]*([^\u3000\s]+[\n\r]?)/g, '$1');
        }
      }
      for(var i in lines) {
        newText += lines[i];
        if (i != lines.length - 1) {
           newText += '\n';
        }
      }
      editor.setText(newText);
    }
  },

  // 更新字数
  updateCount(count) {
    // console.log('updateCount');
    if (count !== undefined) {
      this.counterView.setCount(0);
    } else {
      var editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        var text = editor.getText().replace(/[\s\n]/g, '').length;
        this.counterView.setCount(text);
      }
    }
  },

  // 下划线转驼峰
  snakeToCamel() {
    const editor = atom.workspace.getActivePaneItem();
    const selections = editor.getSelections();
    if (selections.length >= 1) {
      for (let i in selections) {
        let selection = selections[i];
        let text = selection.getText();
        text = text.replace(/([a-zA-Z0-9_]*)/g, ($0, $1) => $1.toLowerCase().replace(/_([a-z])/g, ($0, $1) => $1.toUpperCase()));
        selection.insertText(text);
      }
    }
  },
  // 驼峰转下划线
  camelToSnake() {
    const editor = atom.workspace.getActivePaneItem();
    const selections = editor.getSelections();
    if (selections.length >= 1) {
      for (let i in selections) {
        let selection = selections[i];
        let text = selection.getText();
        text = text.replace(/([a-zA-Z0-9_]*)/g, ($0, $1) => $1.replace(/([A-Z])/g, ($0, $1) => (('_' + $1).toLowerCase())));
        selection.insertText(text);
      }
    }
  },

  consumeStatusBar(statusBar) {
    this.statusBarTile = statusBar.addRightTile({ item: this.indentView, priority: 0 });
    this.statusBarTile = statusBar.addRightTile({ item: this.counterView, priority: 0 });
  }

};
