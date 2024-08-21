'use strict';

let mongodb = require('mongodb');
const mongoose = require('mongoose');
let uri = process.env.MONGO_URI;


module.exports = function (app) {

  mongoose.connect(uri);

  let issueSchema = new mongoose.Schema({
    issue_title: {type: String, require: true},
    issue_text: {type: String, require: true},
    created_on: {type: Date, require: true},
    updated_on: {type: Date, require: true},
    created_by: {type: String, require: true},
    assigned_to: String,
    open: {type: Boolean, require: true},
    status_text: String,
    project: String,
  })

  let Issue = mongoose.model('Issue', issueSchema);

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let filterObject = Object.assign(req.query)
      filterObject['project'] = project
      Issue.find(filterObject)
      .then(result => {
        return res.json(result);
      })
    })
    
    .post(function (req, res){
      let project = req.params.project;

      if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        // return res.json({ error: 'required field(s) missing' });
        return res.json({ error: 'required field(s) missing' });
      }

      let newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: new Date().toUTCString(),
        updated_on: new Date().toUTCString(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        open: true,
        status_text: req.body.status_text || '',
        project: req.body.project,
      });

      newIssue.save()
      .then(data => {
        return res.json(data);
      })
      .catch(err => {
        console.log('Unable to save to database');
      })
    })
    
    .put(function (req, res){
      let project = req.params.project;

      if(!req.body._id) {
        return res.json({ error: 'missing _id' });
      }

      let updateObject = {};
      Object.keys(req.body).forEach(key => {
        if(req.body[key] != '') {
          updateObject[key] = req.body[key];
        }
      })
      if(Object.keys(updateObject).length < 2) {
        return res.json({error: "no update field(s) sent", _id: updateObject._id});
        // return res.json("no update field(s) sent");
      }

      updateObject['updated_on'] = new Date().toUTCString();

      Issue.findByIdAndUpdate(
        req.body._id,
        updateObject,
        {new: true}
      )
      .then (updatedIssue => {
        if(!updatedIssue) {
          return res.json({error: 'could not update', _id: req.body._id});
        }
        return res.json({result: 'successfully updated', _id: req.body._id });
      })
      .catch(err => {
        return res.json({error: 'could not update', _id: req.body._id});
      })
    })
    
    .delete(function (req, res){
      let project = req.params.project;

      if(!req.body._id) {
        return res.json({ error: 'missing _id' });
      }

      Issue.findByIdAndDelete(req.body._id)
      .then(deletedIssue => {
        if(!deletedIssue) {
          // return res.json('could not delete' + ',' + '_id:' + req.body._id)
          return res.json({error: 'could not delete', _id: req.body._id})
        }
        return res.json({ result: 'successfully deleted', _id: deletedIssue.id });
      })
      .catch(err => {
        return res.json({error: 'could not delete', _id: req.body.id})
      }) 
    });
    
};
