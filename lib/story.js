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

    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      if (editor) {
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

  updateIndent() {
    var editor = atom.workspace.getActiveTextEditor();
    if (editor.getTitle().match(/\.story$/)) {
      var indentSwitch = this.indentView.getIndentSwitch();
      var text = '';
      var indent = '    ';
      if (indentSwitch) {
        text = editor.getText().replace(/[\t\ ]*(.+[\n\r]?)/g, indent + '$1');
      } else {
        text = editor.getText().replace(/[\t\ ]*(.+[\n\r]?)/g, '$1');
      }
      editor.setText(text);
    }
  },

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