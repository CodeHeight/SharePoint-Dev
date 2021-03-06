import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import {
  Environment, EnvironmentType
} from '@microsoft/sp-core-library';

import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

import styles from './HelloWorldWebPart.module.scss';
import * as strings from 'HelloWorldWebPartStrings';
import { IHelloWorldWebPartProps } from './IHelloWorldWebPartProps';

export default class HelloWorldWebPartWebPart extends BaseClientSideWebPart<IHelloWorldWebPartProps> {

  public render(): void {
    this.domElement.innerHTML = `
      <div class="${styles.helloWorld}">
        <div class="${styles.container}">
          <div class="ms-Grid-row ms-bgColor-themeDark ms-fontColor-white ${styles.row}">
            <div class="ms-Grid-col ms-lg10 ms-xl8 ms-xlPush2 ms-lgPush1">
              <span class="ms-font-xl ms-fontColor-white">Welcome to SharePoint!</span>
              <p class="ms-font-l ms-fontColor-white">Customize SharePoint experiences using Web Parts.</p>
              <p class="ms-font-l ms-fontColor-white">${escape(this.properties.description)}</p>
              <p class="ms-font-l ms-fontColor-white">Selected Color: ${escape(this.properties.color)}</p>
              <a href="https://aka.ms/spfx" class="${styles.button}">
                <span class="${styles.label}">Learn more</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div id="lists"></div>`;

      this.getListsInfo();
  }

  private getListsInfo() {
    let html: string = '';
    if (Environment.type === EnvironmentType.Local) {
      this.domElement.querySelector('#lists').innerHTML = "Sorry this does not work in local workbench"
    } else {
      this.context.spHttpClient.get(
        this.context.pageContext.web.absoluteUrl + `/_api/web/lists?$filter=Hidden eq false`, SPHttpClient.configurations.v1)
        .then((response: SPHttpClientResponse) => {
          response.json().then((listsObjects: any) => {
            listsObjects.value.forEach(listObject => {
              html += `
                      <ul>
                          <li>
                              <span class="ms-font-1">${listObject.Title}</span>
                          </li>
                      </ul>`;
            });
            this.domElement.querySelector('#lists').innerHTML = html;
          });
        });
    }
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected get disableReactivePropertyChanges():boolean {
    return true;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                  //onGetErrorMessage: this.validateDescription.bind(this)
                }),
                PropertyPaneDropdown('color', {
                  label: 'Dropdown',
                  options: [
                    { key: '1', text: 'Red' },
                    { key: '2', text: 'Blue' },
                    { key: '3', text: 'Green' }
                  ]
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
