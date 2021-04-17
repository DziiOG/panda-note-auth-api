/**
 * @summary Aggregate Builder.
 * @author Whitson <workwithwhitson@gmail.com>
 */
module.exports.name = 'AggregateBuilder'
module.exports.dependencies = ['miscHelper']
module.exports.factory = helpers => {
  'use strict'

  const { COMPLETED } = helpers.Status

  const match = x => ({ $match: x })
  const sort = x => ({ $sort: x })
  const limit = x => ({ $limit: x })
  const group = x => ({ $group: x })
  const project = x => ({ $project: x })
  const lookup = (f, l, p, as) => ({ $lookup: { from: f, let: l, pipeline: p, as } })

  const farmsAggregate = (query = {}, key, id) => {
    const array = [] // main array pipeline
    const pc = [] // pipeline for crop
    const pcv = [] // pipeline for crop variety

    array.push(match(query))
    array.push(sort({ priority: -1 }))

    // crop match expression
    const cropExpr = { $expr: { $eq: ['$_id', '$$crop'] } }

    // if fetching base on crop category add the category id to the crop match expression
    if (key === 'category') cropExpr.category = id
    // crop pipeline
    pc.push(match(cropExpr))

    // if fetching base on farm priority we limit the fetch to only 3 farms obj
    if (key === 'priority') array.push(limit(3))

    // crop variety pipeline
    pcv.push(match({ $expr: { $eq: ['$_id', '$$cropVariety'] } }))
    // lookup crop
    pcv.push(lookup('crops', { crop: '$crop' }, pc, 'crop'))
    // unwind crop
    pcv.push({ $unwind: '$crop' })

    // lookup crop variety
    array.push(lookup('cropvarieties', { cropVariety: '$cropVariety' }, pcv, 'cropVariety'))
    // unwind crop variety
    array.push({ $unwind: '$cropVariety' })

    // farm location pipeline
    const pl = [match({ $expr: { $eq: ['$_id', '$$location'] } })]

    // lookup location
    array.push(lookup('locations', { location: '$location' }, pl, 'location'))
    array.push({ $unwind: '$location' })

    return array
  }

  const farmFeedsAggregate = (matchQuery = {}) => {
    const query = [] // main array pipeline
    const pt = [] // pipeline for task
    const pa = [] // pipeline for activity

    query.push(match(matchQuery))
    query.push(sort({ createdAt: -1 }))

    // activity pipeline
    pa.push(match({ status: COMPLETED, $expr: { $eq: ['$_id', '$$activity'] } }))
    pa.push(project({ createdAt: 0, updatedAt: 0 }))

    // task pipeline
    pt.push(match({ status: COMPLETED, $expr: { $eq: ['$_id', '$$task'] } }))
    // lookup activity
    pt.push(lookup('activities', { activity: '$activity' }, pa, 'activity'))
    // unwind activity
    pt.push({ $unwind: '$activity' })
    pt.push(project({ farm: 0, createdAt: 0, updatedAt: 0 }))

    // lookup task
    query.push(lookup('tasks', { task: '$task' }, pt, 'task'))
    // unwind task
    query.push({ $unwind: '$task' })
    query.push(
      group({
        _id: {
          _id: '$task.activity._id',
          priority: '$task.activity.priority',
          status: '$task.activity.status',
          title: '$task.activity.title',
          farm: '$task.activity.farm',
          description: '$task.activity.description'
        },
        data: {
          $push: {
            task: {
              _id: '$task._id',
              kpis: '$task.kpis',
              title: '$task.title',
              inputs: '$task.inputs',
              budget: '$task.budget',
              duration: '$task.duration',
              warnings: '$task.warnings',
              priority: '$task.priority',
              description: '$task.description',
              instructions: '$task.instructions'
            },
            feed: {
              _id: '$_id',
              likes: '$likes',
              plantInfo: '$plantInfo',
              media: '$media',
              summary: '$summary'
            }
          }
        }
      })
    )

    query.push(
      project({
        _id: '$_id._id',
        status: '$_id.status',
        priority: '$_id.priority',
        farm: '$_id.farm',
        title: '$_id.title',
        description: '$_id.description',
        data: 1
      })
    )

    query.push(sort({ priority: -1 }))

    return query
  }

  return { farmsAggregate, farmFeedsAggregate }
}
