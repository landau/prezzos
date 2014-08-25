'use strict';

var React = window.React = require('react');
var _ = window._ = require('underscore-contrib');
var is = window.is = require('is-predicate');

//----------  DATA
// CSV lol
var data = [
  ['Fly to moon', 'Space'],
  ['Consume cheese and crackers', 'Lazy'],
  ['Clean helmet', 'Space'],
  ['Meditate', 'Enlightenment'],
  ['Yoga', 'Enlightenment'],
  ['Forgive', 'Enlightenment'],
  ['Take selfie', 'Space'],
  ['Repair panel', 'Space'],
  ['Heat hotpocket', 'Lazy'],
  ['Heat mac & cheese', 'Lazy'],
  ['Hiking', 'Enlightenment'],
  ['Finish jQcon ta...', 'Lazy']
];
//----------  MODELING

var NEW_LIST = 'New List';

function mkTask(text, type) {
  var id = _.uniqueId('task');

  return {
    id: id,
    text: text,
    type: type,
    createdAt: Date.now(),
    complete: false
  };
}

var applyMkTask = Function.apply.bind(mkTask, null);
var getType = _.property('type');
var applyGetType = Function.apply.bind(getType, null);
var getText = _.property('text');
var getId = _.property('id');

var isIncomplete = _.compose(is.falsey, _.property('complete'));
var hasText = _.compose(is.pos, _.property('length'), getText);

//----------  VIEWS
var TasksItem = React.createClass({
  onClick: function() {
    this.props.onClick(this.props.type);
  },
  
  render: function() {
    var incomplete = this.props.tasks.filter(hasText).filter(isIncomplete);
    
    return (
      <li className="list-group-item" onClick={this.onClick}>
        <span className="badge">{incomplete.length ? incomplete.length : ''}</span>
        {this.props.type}
      </li>
    );
  }
});

var Toolbar = React.createClass({
  onNew: function() {
    this.props.onNew(mkTask('', NEW_LIST));
  },
  
  render: function() {
    var cls = 'btn btn-default';

    return (
     <div className="btn-group">
        <button type="button" className={cls} onClick={this.onNew}>+</button>
     </div>
    );
  }
});

var Sidebar = React.createClass({
  render: function() {
    var tasks = _.chain(this.props.tasks)
          .groupBy(getType)
          .map(this.renderTask, this)
          .value();

    return (
      <div className="col-md-5" id="sidebar">
        <div className="row">
          <div className="col-md-12">
            <ul className="list-group">
            {tasks}
            </ul>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <Toolbar onNew={this.props.onNew} />
          </div>
        </div>
      </div>
    );
  },

  renderTask: function(tasks, type) {
    return <TasksItem type={type} tasks={tasks} key={type} onClick={this.props.onSelect} />;
  }
});

var TitleBar = React.createClass({
  onChange: function(e) {
    this.props.onTypeChange(e.target.value);
  },

  onAdd: function() {
    this.props.onAdd(mkTask('', this.props.title));
  },

  render: function() {
    return (
     <div className="input-group">
      <input style={{ fontSize: '50px', height: 'auto' }} type="text" className="form-control no-shadow"
         value={this.props.title} onChange={this.onChange} />
      <div className="input-group-addon">
        <button type="button" className="btn btn-default btn-sm pull-right"
          onClick={this.onAdd}>+</button>
      </div>
     </div>
    );
  }
});

var Filter = React.createClass({
  getInitialState: function() {
    return {
      text: ''
    };
  },
  
  onChange: function(e) {
    var term = e.target.value.trim();
    this.setState({ text: e.target.value });

    if (!term) return this.props.onSearch(_.identity);
    
    var rgx = new RegExp('.*' + term + '.*', 'gi');
    function test(str) {
      rgx.lastIndex = 0;
      return rgx.test(str);
    }
    
    this.props.onSearch(_.compose(test, getText));
  },

  onABCSort: function() {
    this.props.onSort(_.comparator(function(a, b) {
      var args = _.chain(arguments).map(getText).invoke('toLowerCase').value();
      return is.lt.apply(null, args);
    }));
  },

  onIncompleteSort: function() {
    this.props.onSort(_.comparator(function(a, b) {
      return !a.complete && b.complete;
    }));
  },

  onCreatedAtSort: function() {
    // Oldest first
    this.props.onSort(_.comparator(function(a, b) {
      return is.lt.apply(null, _.map(arguments, _.property('createdAt')));
    }));
  },
  
  render: function() {
    var cls = 'btn btn-default';

    return (
      <form role="form" className="form-inline filter-form">
        <div className="form-group">
          <input className="form-control" type="search" value={this.state.text}
            placeholder='Filter...' onChange={this.onChange} />

          <div className="btn-group">
             <button type="button" className={cls} onClick={this.onABCSort}>ABC</button>
             <button type="button" className={cls} onClick={this.onIncompleteSort}>Incomplete</button>
             <button type="button" className={cls} onClick={this.onCreatedAtSort}>Date</button>
          </div>
        </div>
      </form>
    );
  }
});

var TaskListItem = React.createClass({
  onChange: function(e) {
    var t = _.defaults({ text: e.target.value }, this.props.task);  
    this.props.onChange(t);
  },

  onCheckbox: function(e) {
    var t = _.defaults({ complete: e.target.checked }, this.props.task);  
    this.props.onChange(t);
  },
  
  render: function() {
    var task = this.props.task;
    
    return (
      <li className="list-group-item">
        <form className="form" role="form">
          <div className="form-group">
            <div className="input-group">
              <div className="input-group-addon">
                <input type="checkbox" onChange={this.onCheckbox} checked={task.complete} />
              </div>
              <input type="text" className="form-control" value={task.text} onChange={this.onChange} />
            </div>
          </div>
        </form>
      </li>
    );
  }
});

var TaskList = React.createClass({
  getInitialState: function() {
    return {
      searchFilter: _.identity,
      comparator: _.noop
    };
  },

  onSearch: function(filter) {
    this.setState({ searchFilter: filter });
  },

  onSort: function(comparator) {
    this.setState({ comparator: comparator });
  },
  
  onTypeChange: function(type) {
    var tasks = this.props.tasks.map(function(t) {
      return _.defaults({ type: type }, t);
    });

    this.props.onChangeTasks(tasks);
  },

  render: function() {
    var type = applyGetType(this.props.tasks);
    var tasks = this.props.tasks.filter(this.state.searchFilter);
    tasks.sort(this.state.comparator);

    return (
      <div className="col-md-7" id="list">

        <div className="row">
          <div className="col-md-12">
            <TitleBar title={type}
              onTypeChange={this.onTypeChange}
              onAdd={this.props.onAddTask}/>
          </div>
        </div>

        <div className="row">
         <div className="col-md-12">
           <Filter onSearch={this.onSearch} onSort={this.onSort} />
           <ul className="list-group">
            {tasks.map(function (t) {
              return <TaskListItem task={t} key={t.id} onChange={this.props.onChangeTask} />;
            }, this)}
           </ul>
         </div>
        </div>
      </div>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    var tasks = data.map(applyMkTask);

    window.tasks = tasks;

    return {
      tasks: tasks,
      activeType: applyGetType(tasks)
    };
  },

  onTypeSelect: function(type) {
    this.setState({
      activeType: type
    });
  },

  onChangeTasks: function(tasks) {
    // Maintain order of tasks
    var ts = this.state.tasks.map(function(task) {
      var match = _.find(tasks, _.compose(is.equal(task.id), getId));
      if (match) return match;
      return task;
    });

    this.setState({
      activeType: applyGetType(tasks),
      tasks: ts
    });
  },

  onAddTask: function(task) {
    this.setState({
      activeType: getType(task),
      tasks: this.state.tasks.concat(task)
    });
  },

  onChangeTask: function(task) {
    var isTask = _.compose(is.equal(task.id), getId);

    var tasks = this.state.tasks.map(function(t) {
      // Replace updated task
      return isTask(t) ? task : t;
    });

    this.setState({ tasks: tasks });
  },

  onDeleteTasks: function(task) {
    var tasks = this.state.tasks.filter(_.compose(is.equal(task.id), getId));
    this.setState({ tasks: tasks });
  },

  render: function() {
    var active = this.state.tasks.filter(_.compose(is.equal(this.state.activeType), getType));

    return (
      <div className="row" id="main">
        <Sidebar tasks={this.state.tasks}
          onSelect={this.onTypeSelect}
          onNew={this.onAddTask} />
        <TaskList tasks={active}
          onChangeTasks={this.onChangeTasks}
          onAddTask={this.onAddTask}
          onChangeTask={this.onChangeTask} />
      </div>
    );
  }
});

React.renderComponent(<App />, document.querySelector('.container'));
