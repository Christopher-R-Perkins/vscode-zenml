// Copyright(c) ZenML GmbH 2024. All Rights Reserved.
// Licensed under the Apache License, Version 2.0(the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at:
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
// or implied.See the License for the specific language governing
// permissions and limitations under the License.

import { ErrorMessageResponse, VersionMismatchError } from './LSClientResponseTypes';

interface PipelineRunsData {
  runs: PipelineRun[];
  total: number;
  total_pages: number;
  current_page: number;
  items_per_page: number;
}

export interface PipelineRun {
  id: string;
  name: string;
  status: string;
  version: string;
  stackName: string;
  startTime: string;
  endTime: string;
  os: string;
  osVersion: string;
  pythonVersion: string;
}

export interface DagStep {
  id: string;
  type: 'step';
  data: {
    execution_id: string;
    name: string;
    status: 'initializing' | 'failed' | 'completed' | 'running' | 'cached';
  };
}

export interface DagArtifact {
  id: string;
  type: 'artifact';
  data: {
    execution_id: string;
    name: string;
    artifact_type: string;
  };
}

export type DagNode = DagStep | DagArtifact;

export interface DagEdge {
  id: string;
  source: string;
  target: string;
}

export interface PipelineRunDag {
  nodes: Array<DagNode>;
  edges: Array<DagEdge>;
  status: string;
  name: string;
  version: string;
}

export type PipelineRunsResponse = PipelineRunsData | ErrorMessageResponse | VersionMismatchError;
