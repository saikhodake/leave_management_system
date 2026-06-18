const express = require("express");
const router = express.Router();

const { Op } = require("sequelize");

const {
  uploadProjectDocuments,
} = require("../middlewares/uploadMiddleware");;
const ClientProject = require("../models/clientProjectModel");

/* -----------------------------
   CREATE PROJECT
   POST /api/client-project/create
----------------------------- */
router.post("/create", async (req, res) => {
  try {
    const {
      companyName,
      clientName,
      projectTitle,
      projectDescription,
      startDate,
      endDate,
      deadline,
    } = req.body;

    if (!companyName || !clientName || !projectTitle) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const project = await ClientProject.create({
      companyName,
      clientName,
      projectTitle,
      projectDescription,
      startDate,
      endDate,
      deadline,
      meetings: [],
    });

    res.status(201).json({
      success: true,
      message: "Project created",
      data: project,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* -----------------------------
   GET ALL PROJECTS
   GET /api/client-project/
----------------------------- */
router.get("/", async (req, res) => {
  try {
    const projects = await ClientProject.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: projects,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* -----------------------------
   GET SINGLE PROJECT
   GET /api/client-project/:id
----------------------------- */
router.get("/:id", async (req, res) => {
  try {
    const project = await ClientProject.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* -----------------------------
   ADD MEETING (WITH FILES)
   POST /api/client-project/:id/add-meeting
----------------------------- */
router.post(
  "/:id/add-meeting",
 uploadProjectDocuments,
  async (req, res) => {
    try {
      const project = await ClientProject.findByPk(req.params.id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      const { title, description, date } = req.body;

      const meeting = {
        id: Date.now(),
        title,
        description,
        date,
        documents: req.files
          ? req.files.map((f) => ({
              filename: f.filename,
              path: f.path,
              mimetype: f.mimetype,
              uploadedAt: new Date(),
            }))
          : [],
      };

      const updatedMeetings = [
        ...(project.meetings || []),
        meeting,
      ];

      await project.update({
        meetings: updatedMeetings,
      });

      res.json({
        success: true,
        message: "Meeting added",
        data: meeting,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

/* -----------------------------
   EDIT PROJECT
   PUT /api/client-project/:id/edit
----------------------------- */
router.put("/:id/edit", async (req, res) => {
  try {
    const project = await ClientProject.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await project.update(req.body);

    res.json({
      success: true,
      message: "Project updated",
      data: project,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* -----------------------------
   EDIT MEETING
   PUT /api/client-project/:projectId/meetings/:meetingId
----------------------------- */
router.put(
  "/:projectId/meetings/:meetingId",
  async (req, res) => {
    try {
      const project = await ClientProject.findByPk(
        req.params.projectId
      );

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      let meetings = project.meetings || [];

      const index = meetings.findIndex(
        (m) => m.id == req.params.meetingId
      );

      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: "Meeting not found",
        });
      }

      meetings[index] = {
        ...meetings[index],
        ...req.body,
      };

      await project.update({
        meetings,
      });

      res.json({
        success: true,
        message: "Meeting updated",
        data: meetings[index],
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

module.exports = router;