const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

let id1 = '';
let id2 = '';

chai.use(chaiHttp);

suite('Functional Tests', function() {

    suite('GET api/issues/{projects} => Array of objects with issue data', () => {
        test('No filter', done => {
            chai
            .request(server)
            .get("/api/issues/test")
            .query({})
            .end(function(err, res) {
              assert.equal(res.status, 200);
            //   assert.isArray(res.body);
            //   assert.property(res.body[0], "issue_title");
            //   assert.property(res.body[0], "issue_text");
            //   assert.property(res.body[0], "created_on");
            //   assert.property(res.body[0], "updated_on");
            //   assert.property(res.body[0], "created_by");
            //   assert.property(res.body[0], "assigned_to");
            //   assert.property(res.body[0], "open");
            //   assert.property(res.body[0], "status_text");
            //   assert.property(res.body[0], "_id");
            })
            done();
        })

        test('One filter', done => {
            chai
            .request(server)
            .get("/api/issues/test")
            .query({ created_by: "Functional Test - Every field filled in" })
            .end(function(err, res) {
              res.body.forEach(issueResult => {
                assert.equal(issueResult.created_by, "Functional Test - Every field filled in");
              });
            });
            done();
        })

        test('Multiple filters (test for multiple fields you know will be in the db for a return', done => {
            chai
            .request(server)
            .get("/api/issues/test")
            .query({
              open: true,
              created_by: "Functional Test - Every field filled in"
            })
            .end(function(err, res) {
              res.body.forEach(issueResult => {
                assert.equal(issueResult.open, true);
                assert.equal(issueResult.created_by, "Functional Test - Every field filled in");
              });
            })
            done();
        })
    })

    suite('POST /api/issues/{projects} => object with issue data', () => {
        test('Every field filled in', (done) => {
            chai
                .request(server)
                .post("/api/issues/test")
                .send({
                issue_title: "Title",
                issue_text: "text",
                created_by: "Functional Test - Every field filled in",
                assigned_to: "Chai and Mocha",
                status_text: "In QA"
                })
                .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_title, "Title");
                assert.equal(res.body.issue_text, "text");
                assert.equal(res.body.created_by, "Functional Test - Every field filled in");
                assert.equal(res.body.assigned_to, "Chai and Mocha");
                assert.equal(res.body.status_text, "In QA");
                // assert.equal(res.body.project, "test");
                id1 = res.body._id;
                console.log("id 1 has been set as " + id1);
                done();
            });
            // done();
        })

        test('Required fields filled in', (done) => {
            chai
                .request(server)
                .post("/api/issues/test")
                .send({
                issue_title: "Title 2",
                issue_text: "text",
                created_by: "Functional Test - Every field filled in"
                })
                .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_title, "Title 2");
                assert.equal(res.body.issue_text, "text");
                assert.equal(res.body.created_by, "Functional Test - Every field filled in"
                );
                assert.equal(res.body.assigned_to, "");
                assert.equal(res.body.status_text, "");
                // assert.equal(res.body.project, "test");
                id2 = res.body._id;
                console.log("id 2 has been set as " + id2);
                done();
            })
            // done();
        })

        test('Missing fields filled in', (done) => {
            chai
                .request(server)
                .post("/api/issues/test")
                .send({
                    issue_title: "Title"
                })
                .end(function(err, res) {
                    assert.equal(res.body, 'required field(s) missing');
                    done();
            })
            // done();
        })
    });

    suite('PUT /api/issues/{projects} => text', () => {
        test('No body', done => {
            chai
                .request(server)
                .put("/api/issues/test")
                .send({
                    _id: id1
                })
                .end(function(err, res) {
                assert.equal(res.body, 'no update field sent' + ',' + '_id:' + id1);
                done();
            })
            // done();
        })

        test('One field to update', done => {
            chai
                .request(server)
                .put("/api/issues/test")
                .send({
                _id: id1,
                issue_text: "new text"
                })
                .end(function(err, res) {
                assert.equal(res.body, "successfully updated" + ',' + '_id:' + id1);
                done();
            })
            // done();
        })

        test('Multiple fields to update', done => {
            chai
                .request(server)
                .put("/api/issues/test")
                .send({
                _id: id2,
                issue_title: "new title",
                issue_text: "new text"
                })
                .end(function(err, res) {
                assert.equal(res.body, "successfully updated" + ',' + '_id:' + id2);
                done();
            })
            // done();
        })
    })

    suite('DELETE /api/issues/{projects} => text', () => {
        test('No _id', done => {
            chai
            .request(server)
            .delete("/api/issues/test")
            .send({})
            .end(function(err, res) {
              assert.equal(res.body, 'missing _id');
              done();
            })
            // done();
        })

        test('Valid _id', done => {
            chai
          .request(server)
          .delete("/api/issues/test")
          .send({
            _id: id1
          })
          .end((err, res) => {
            assert.equal(res.body, 'successfully deleted'  + ',' + '_id:' + id1);
          })

            chai
            .request(server)
            .delete('/api/issues/test')
            .send({
                _id: id2
            })
            .end((err, res) => {
                assert.equal(res.body, 'successfully deleted'  + ',' + '_id:' + id2)
            })
            done();
        })
    })  
});
