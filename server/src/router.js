const studentController = require('./controller/student');
const MapController  = require('./controller/map')
const TrajController = require('./controller/traj')


module.exports = (router) => {
  router.prefix('/api');
  router
  	.get('/profile',studentController.profile)
    .post('/stu_overview',studentController.overview)
    .get('/grids1',MapController.grids_floor1 )
    .get('/grids2',MapController.grids_floor2 )
    .post('/rooms',MapController.rooms_floor )
    .post('/trajs',TrajController.trajs)

};
