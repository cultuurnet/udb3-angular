'use strict';

describe('Factory: DeleteRoleJob', function () {

  var role = {
    uuid: 'blub-id',
    name: 'Blub'
  };

  beforeEach(module('udb.management'));
  beforeEach(module('udb.management.roles'));

  it('should set all the properties on create', inject(function (DeleteRoleJob) {
    var roleJob = new DeleteRoleJob('theCommandId', role);
    expect(roleJob.role).toEqual(role);
    expect(roleJob.id).toEqual('theCommandId');
  }));

  it('should resolve the task on succesfull finish', inject(function (DeleteRoleJob, JobStates) {
    var roleJob = new DeleteRoleJob('theCommandId', role);
    roleJob.state = JobStates.STARTED;
    roleJob.finish();
    expect(roleJob.state).toEqual(JobStates.FINISHED);
    expect(roleJob.task.promise.$$state.status).toEqual(1);
  }));

  it('should reject the task on failure', inject(function (DeleteRoleJob, JobStates) {
    var roleJob = new DeleteRoleJob('theCommandId', role);
    roleJob.state = JobStates.STARTED;
    roleJob.fail();
    expect(roleJob.state).toEqual(JobStates.FAILED);
    expect(roleJob.task.promise.$$state.status).toEqual(2);
  }));

  it('should return a description', inject(function (DeleteRoleJob) {
    var roleJob = new DeleteRoleJob('theCommandId', role);
    expect(roleJob.getDescription()).toEqual('Role verwijderen: "Blub".');
  }));
});