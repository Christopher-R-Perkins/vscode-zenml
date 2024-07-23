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
import * as vscode from 'vscode';

import ZenMLStatusBar from '../../views/statusBar';
import { LSClient } from '../../services/LSClient';
import { showInformationMessage } from '../../utils/notifications';
import Panels from '../../common/panels';
import { ComponentDataProvider } from '../../views/activityBar/componentView/ComponentDataProvider';
import { ComponentTypesResponse, Flavor, FlavorListResponse } from '../../types/StackTypes';
import { getFlavor, getFlavorsOfType } from '../../common/api';
import ComponentForm from './ComponentsForm';
import { StackComponentTreeItem } from '../../views/activityBar';
import { traceError } from '../../common/log/logging';

const refreshComponentView = async () => {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Refreshing Component View...',
      cancellable: false,
    },
    async progress => {
      await ComponentDataProvider.getInstance().refresh();
    }
  );
};

const createComponent = async () => {
  const lsClient = LSClient.getInstance();
  try {
    const types = await lsClient.sendLsClientRequest<ComponentTypesResponse>('getComponentTypes');

    if ('error' in types) {
      throw new Error(String(types.error));
    }

    const type = await vscode.window.showQuickPick(types, {
      title: 'What type of component to create?',
    });
    if (!type) {
      return;
    }

    const flavors = await getFlavorsOfType(type);
    if ('error' in flavors) {
      throw new Error(String(flavors.error));
    }

    const flavorNames = flavors.map(flavor => flavor.name);
    const selectedFlavor = await vscode.window.showQuickPick(flavorNames, {
      title: `What flavor of a ${type} component to create?`,
    });
    if (!selectedFlavor) {
      return;
    }

    const flavor = flavors.find(flavor => selectedFlavor === flavor.name);
    await ComponentForm.getInstance().createForm(flavor as Flavor);
  } catch (e) {
    vscode.window.showErrorMessage(`Unable to open component form: ${e}`);
    traceError(e);
    console.error(e);
  }
};

const updateComponent = async (node: StackComponentTreeItem) => {
  try {
    const flavor = await getFlavor(node.component.flavor);

    await ComponentForm.getInstance().updateForm(
      flavor,
      node.component.name,
      node.component.id,
      node.component.config
    );
  } catch (e) {
    vscode.window.showErrorMessage(`Unable to open component form: ${e}`);
    traceError(e);
    console.error(e);
  }
};

export const componentCommands = {
  refreshComponentView,
  createComponent,
  updateComponent,
};