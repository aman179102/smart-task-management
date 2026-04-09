import Task from '../models/Task.js';

// @desc    Get all tasks for logged in user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build query
    let query = { user: req.user._id };

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const tasks = await Task.find(query).sort(sortOptions);

    // Get statistics
    const stats = await Task.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'completed'] },
                    { $lt: ['$deadline', new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: tasks.length,
      stats: stats[0] || { total: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0 },
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const { title, description, deadline, priority, status } = req.body;

    const task = await Task.create({
      title,
      description,
      deadline: new Date(deadline),
      priority: priority || 'medium',
      status: status || 'pending',
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const updateData = { ...req.body };
    
    // Handle completed status
    if (updateData.status === 'completed' && task.status !== 'completed') {
      updateData.completedAt = new Date();
    } else if (updateData.status !== 'completed') {
      updateData.completedAt = null;
    }

    // Convert deadline to Date if provided
    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline);
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/tasks/stats/dashboard
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await Task.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
          },
          highPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] },
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'completed'] },
                    { $lt: ['$deadline', new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Get recent tasks
    const recentTasks = await Task.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get upcoming deadlines (next 7 days, not completed)
    const upcomingDeadlines = await Task.find({
      user: req.user._id,
      status: { $ne: 'completed' },
      deadline: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })
      .sort({ deadline: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: stats[0] || {
          total: 0,
          completed: 0,
          pending: 0,
          inProgress: 0,
          highPriority: 0,
          overdue: 0,
        },
        recentTasks,
        upcomingDeadlines,
      },
    });
  } catch (error) {
    next(error);
  }
};
