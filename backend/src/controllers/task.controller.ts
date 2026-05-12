import { Response } from "express";
import prisma from "../lib/prisma.js";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth.middleware.js";

const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]).optional().default("PENDING"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().default("MEDIUM"),
});

const updateTaskSchema = taskSchema.partial();

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks (Admin gets all, User gets own)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, DONE]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 */
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, priority } = req.query;
    const isAdmin = req.user?.role === "ADMIN";

    const where: Record<string, unknown> = {};
    if (!isAdmin) where.userId = req.user?.id;
    if (status) where.status = status as string;
    if (priority) where.priority = priority as string;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ tasks, count: tasks.length });
  } catch (error) {
    console.error("GetTasks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 */
export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id as string;
    const isAdmin = req.user?.role === "ADMIN";

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    if (!isAdmin && task.userId !== req.user?.id) {
      res.status(403).json({ error: "Forbidden. This task doesn't belong to you." });
      return;
    }

    res.status(200).json({ task });
  } catch (error) {
    console.error("GetTaskById error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, DONE]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Validation error
 */
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = taskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const task = await prisma.task.create({
      data: { ...parsed.data, userId: req.user?.id as string },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    console.error("CreateTask error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   patch:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, DONE]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *     responses:
 *       200:
 *         description: Task updated
 *       404:
 *         description: Task not found
 */
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id as string;
    const isAdmin = req.user?.role === "ADMIN";

    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    if (!isAdmin && task.userId !== req.user?.id) {
      res.status(403).json({ error: "Forbidden. You cannot update this task." });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: parsed.data,
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    res.status(200).json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error("UpdateTask error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id as string;
    const isAdmin = req.user?.role === "ADMIN";

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    if (!isAdmin && task.userId !== req.user?.id) {
      res.status(403).json({ error: "Forbidden. You cannot delete this task." });
      return;
    }

    await prisma.task.delete({ where: { id: taskId } });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("DeleteTask error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
