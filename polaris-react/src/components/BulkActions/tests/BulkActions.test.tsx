import React from 'react';
import {Transition, CSSTransition} from 'react-transition-group';
import {mountWithApp} from 'tests/utilities';

import {ActionList} from '../../ActionList';
import {
  BulkActionButton,
  BulkActionMenu,
  BulkActionButtonProps,
} from '../components';
import {BulkAction, BulkActions, BulkActionsProps} from '../BulkActions';

interface Props {
  bulkActions: BulkActionButtonProps['content'][];
  promotedActions: NonNullable<BulkActionsProps['promotedActions']>;
  disabled: boolean;
  width: number;
  isSticky: boolean;
}

const bulkActionProps: Props = {
  bulkActions: ['button 3', 'button 4', 'button 5'],
  promotedActions: [
    {
      content: 'button 1',
    },
    {
      content: 'button 2',
    },
  ],
  disabled: false,
  width: 500,
  isSticky: false,
};

describe('<BulkActions />', () => {
  describe('actions', () => {
    it('indicator is passed to BulkActionButton when actions contain a new status for badge', () => {
      const bulkActions = mountWithApp(
        <BulkActions
          {...bulkActionProps}
          promotedActions={[]}
          actions={[
            {content: 'Action', badge: {status: 'new', content: 'Badge'}},
          ]}
        />,
      );

      bulkActions.find(BulkActionButton)?.trigger('onAction');

      expect(bulkActions).toContainReactComponent(BulkActionButton, {
        indicator: true,
      });
    });

    it('indicator is not passed to BulkActionButton when actions does not contain a new status for badge', () => {
      const bulkActions = mountWithApp(
        <BulkActions
          {...bulkActionProps}
          promotedActions={[]}
          actions={[{content: 'Action'}]}
        />,
      );

      bulkActions.find(BulkActionButton)?.trigger('onAction');

      expect(bulkActions).toContainReactComponent(BulkActionButton, {
        indicator: false,
      });
    });

    it('promotedActions render in the last position on initial load', () => {
      const {promotedActions} = bulkActionProps;
      const bulkActions = mountWithApp(
        <BulkActions {...bulkActionProps} promotedActions={promotedActions} />,
      );

      const bulkActionsCount = bulkActions.findAllWhere(
        (node: any) =>
          node.props.content === (promotedActions[0] as BulkAction).content ||
          node.props.content === (promotedActions[1] as BulkAction).content,
      ).length;

      expect(bulkActionsCount).toBe(promotedActions.length);
    });

    it('bulkActions render in the first position on initial load', () => {
      const {bulkActions} = bulkActionProps;
      const bulkActionsElement = mountWithApp(
        <BulkActions {...bulkActionProps} />,
      );
      const bulkActionsCount = bulkActionsElement.findAllWhere(
        (node: any) =>
          node.props.content === bulkActions[0] ||
          node.props.content === bulkActions[1] ||
          node.props.content === bulkActions[2],
      ).length;

      expect(bulkActionsCount).toBe(0);
    });
  });

  describe('loading', () => {
    it('disables buttons', () => {
      const bulkActionsElement = mountWithApp(
        <BulkActions
          {...bulkActionProps}
          promotedActions={[
            {
              content: 'button 1',
            },
          ]}
          disabled
        />,
      );

      expect(bulkActionsElement).toContainReactComponentTimes('button', 1, {
        'aria-disabled': true,
      });
    });
  });

  describe('props', () => {
    describe('selectMode', () => {
      it('is passed down to Transition', () => {
        const bulkActions = mountWithApp(
          <BulkActions {...bulkActionProps} selectMode />,
        );

        expect(bulkActions).toContainReactComponent(Transition, {
          in: true,
        });
      });

      it('is passed down to CSSTransition', () => {
        const bulkActions = mountWithApp(
          <BulkActions {...bulkActionProps} selectMode />,
        );

        const cssTransition = bulkActions.findAll(CSSTransition, {
          appear: true,
        });
        cssTransition.forEach((cssTransitionComponent) => {
          expect(cssTransitionComponent).toHaveReactProps({in: true});
        });
      });
    });

    describe('promotedActions', () => {
      let warnSpy: jest.SpyInstance;

      beforeEach(() => {
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      });

      afterEach(() => {
        warnSpy.mockRestore();
      });

      it('renders a BulkActionButton for each item in promotedActions', () => {
        const bulkActionProps: Props = {
          bulkActions: [],
          promotedActions: [
            {
              title: 'button1',
              actions: [
                {
                  content: 'action1',
                },
                {
                  content: 'action2',
                },
              ],
            },
            {
              content: 'button 2',
            },
            {
              content: 'button 3',
            },
          ],
          disabled: false,
          width: 500,
          isSticky: false,
        };
        const bulkActions = mountWithApp(<BulkActions {...bulkActionProps} />);

        expect(bulkActions).toContainReactComponentTimes(BulkActionButton, 3);
      });

      it('renders a BulkActionMenu when promotedActions are menus', () => {
        const bulkActionProps: Props = {
          bulkActions: [],
          promotedActions: [
            {
              title: 'button1',
              actions: [
                {
                  content: 'action1',
                },
                {
                  content: 'action2',
                },
              ],
            },
            {
              title: 'button2',
              actions: [
                {
                  content: 'action1',
                },
                {
                  content: 'action2',
                },
              ],
            },
            {
              content: 'button 2',
            },
            {
              content: 'button 3',
            },
          ],
          disabled: false,
          width: 500,
          isSticky: false,
        };
        const bulkActions = mountWithApp(<BulkActions {...bulkActionProps} />);
        const bulkActionButtons = bulkActions.findAll(BulkActionButton);
        expect(bulkActionButtons).toHaveLength(4);
        const bulkActionMenus = bulkActions.findAll(BulkActionMenu);
        expect(bulkActionMenus).toHaveLength(2);
      });

      it('opens a popover menu when clicking on a promoted action that is a menu', () => {
        const promotedActionToBeClicked = {
          title: 'button1',
          actions: [
            {
              content: 'action1',
            },
            {
              content: 'action2',
            },
          ],
        };
        const bulkActionProps: Props = {
          bulkActions: [],
          promotedActions: [
            {...promotedActionToBeClicked},
            {
              content: 'button 2',
            },
          ],
          disabled: false,
          width: 500,
          isSticky: false,
        };
        const bulkActions = mountWithApp(<BulkActions {...bulkActionProps} />);

        bulkActions.find(BulkActionButton)?.trigger('onAction');

        const actionList = bulkActions.find(ActionList);
        expect(actionList!.prop('items')).toBe(
          promotedActionToBeClicked.actions,
        );
      });
    });

    describe('disabled', () => {
      it('will not overwrite the disabled value coming from a promotedAction', () => {
        const bulkActionProps: Props = {
          bulkActions: [],
          promotedActions: [
            {
              disabled: true,
              content: 'button 1',
            },
          ],
          disabled: false,
          width: 500,
          isSticky: false,
        };
        const bulkActions = mountWithApp(<BulkActions {...bulkActionProps} />);

        expect(bulkActions).toContainReactComponentTimes(BulkActionButton, 1, {
          disabled: true,
        });
      });
    });

    describe('onMoreActionPopoverToggle', () => {
      it('is invoked when the popover is toggled', () => {
        const spy = jest.fn();
        const bulkActions = mountWithApp(
          <BulkActions
            {...bulkActionProps}
            actions={[{content: 'Action'}]}
            promotedActions={[]}
            onMoreActionPopoverToggle={spy}
          />,
        );

        bulkActions.find(BulkActionButton)?.trigger('onAction');

        expect(spy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('buttongroup', () => {
    // Since we need to break our component model and reach into ButtonGroup to access the CheckableButton
    // and ensure only the first element flex grows, we add this test to ensure the mark-up does not change
    it('has the mark-up structure to target the CheckableButton', () => {
      const bulkActions = mountWithApp(
        <BulkActions {...bulkActionProps} selectMode />,
      );

      const checkableButton = bulkActions!
        .find('div', {
          className: 'ButtonGroupWrapper',
        })!
        .domNode!.querySelector('div > div.Item:first-child');
      expect(checkableButton).not.toBeNull();
    });
  });
});
