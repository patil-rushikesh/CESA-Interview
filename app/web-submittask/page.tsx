"use client";

import type React from "react";
import axios from 'axios';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Github, CheckCircle, AlertCircle } from "lucide-react";

const SubmitTaskPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    prn: "",
    githubLink: "",
    notes: "",
    checkpoint: "frontend",
    completionPercentage: [25],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [Loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const checkpoints = {
    frontend: {
      label: "Frontend Only",
      maxProgress: 100,
      color: "bg-orange-500",
    },
    backend: { label: "Backend Only", maxProgress: 100, color: "bg-blue-500" },
    whole: {
      label: "Complete Project",
      maxProgress: 100,
      color: "bg-green-500",
    },
  };

  const validateGithubUrl = (url: string) => {
    const githubRegex = /^https:\/\/github\.com\/[\w\-.]+\/[\w\-.]+\/?$/;
    return githubRegex.test(url);
  };

  const handleCheckpointChange = (checkpoint: string) => {
    const maxProgress =
      checkpoints[checkpoint as keyof typeof checkpoints].maxProgress;
    setFormData((prev) => ({
      ...prev,
      checkpoint,
      completionPercentage: [
        Math.min(prev.completionPercentage[0], maxProgress),
      ],
    }));
  };

  const handleSliderChange = (value: number[]) => {
    const maxProgress =
      checkpoints[formData.checkpoint as keyof typeof checkpoints].maxProgress;
    setFormData((prev) => ({
      ...prev,
      completionPercentage: [Math.min(value[0], maxProgress)],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.prn.trim()) newErrors.prn = "PRN is required";
    if (!formData.githubLink.trim()) {
      newErrors.githubLink = "GitHub link is required";
    } else if (!validateGithubUrl(formData.githubLink)) {
      newErrors.githubLink = "Please enter a valid public GitHub repository URL";
    }
    if (!formData.notes.trim()) newErrors.notes = "Notes are required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        const res = await axios.post("/api/web-submit", { formData });
        if (res.data && res.data.status === 409) {
          setMessage({ type: 'error', text: 'A submission already exists for this PRN.' });
        } else {
          setMessage({ type: 'success', text: 'Submission successful!' });
          setFormData({
            name: "",
            prn: "",
            githubLink: "",
            notes: "",
            checkpoint: "frontend",
            completionPercentage: [0],
          });
          setErrors({});
        }
      } catch (error: any) {
        if (error.response && error.response.data && error.response.data.status === 409) {
          setMessage({ type: 'error', text: 'A submission already exists for this PRN.' });
        } else {
          setMessage({ type: 'error', text: 'Submission failed. Please try again.' });
        }
        console.error("Submission error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const currentCheckpoint =
    checkpoints[formData.checkpoint as keyof typeof checkpoints];
  const progressPercentage =
    (formData.completionPercentage[0] / currentCheckpoint.maxProgress) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
              <Github className="h-8 w-8 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              PCCoE ACM Anatya Event - Project Submission
            </CardTitle>
            <CardDescription className="text-gray-600">
              Submit your website project for the ACM Anatya event with student
              registration functionality
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {message && (
              <div
                className={`rounded p-3 text-center font-medium ${
                  message.type === 'error'
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-green-100 text-green-700 border border-green-300'
                }`}
              >
                {message.text}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Details */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Student Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prn" className="text-sm font-medium">
                    PRN Number *
                  </Label>
                  <Input
                    id="prn"
                    placeholder="Enter your PRN"
                    value={formData.prn}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, prn: e.target.value }))
                    }
                    className={errors.prn ? "border-red-500" : ""}
                  />
                  {errors.prn && (
                    <p className="text-sm text-red-500">{errors.prn}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="github" className="text-sm font-medium">
                  GitHub Repository Link *
                </Label>
                <div className="relative">
                  <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="github"
                    placeholder="https://github.com/username/repository-name"
                    value={formData.githubLink}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        githubLink: e.target.value,
                      }))
                    }
                    className={`pl-10 ${
                      errors.githubLink ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.githubLink && (
                  <p className="text-sm text-red-500">{errors.githubLink}</p>
                )}
                <p className="text-xs text-gray-500">
                  <AlertCircle className="inline h-3 w-3 mr-1" />
                  Repository must be public and accessible
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  Project Completion Checkpoint *
                </Label>
                <RadioGroup
                  value={formData.checkpoint}
                  onValueChange={handleCheckpointChange}
                  className="grid grid-cols-1 gap-3 md:grid-cols-3"
                >
                  {Object.entries(checkpoints).map(([key, checkpoint]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <RadioGroupItem value={key} id={key} />
                      <Label htmlFor={key} className="flex-1 cursor-pointer">
                        <div className="rounded-lg border p-3 transition-colors hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {checkpoint.label}
                            </span>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Task Completion Progress
                  </Label>
                  <Badge variant="outline" className="text-lg font-bold">
                    {formData.completionPercentage[0]}%
                  </Badge>
                </div>

                <div className="space-y-3">
                  <Slider
                    value={formData.completionPercentage}
                    onValueChange={handleSliderChange}
                    max={currentCheckpoint.maxProgress}
                    min={0}
                    step={5}
                    className="w-full"
                  />

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span className="font-medium text-indigo-600">
                      Current: {currentCheckpoint.label}
                    </span>
                    <span>{currentCheckpoint.maxProgress}%</span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${currentCheckpoint.color}`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Project Notes & Description *
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Describe your project implementation, challenges faced, features completed, etc."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className={`min-h-[120px] ${
                    errors.notes ? "border-red-500" : ""
                  }`}
                />
                {errors.notes && (
                  <p className="text-sm text-red-500">{errors.notes}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={Loading}
              >
                {Loading ? (
                  <>
                    <svg className="animate-spin mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit Project
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubmitTaskPage;
