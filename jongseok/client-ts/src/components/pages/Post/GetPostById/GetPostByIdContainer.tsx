import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import GetPostByIdPresenter from './GetPostByIdPresenter';
import { clearPostFn, getPostByIdFn } from '../../../../store/actions/v1/post.action';
import { IRootState } from '../../../../store/reducers/index';
import CommonLayout from '../../../CommonLayout/index';

interface Props extends RouteComponentProps<any> {
  postState: IRootState['postState'];
  getPostByIdFn: any;
  clearPostFn: any;
}

const GetPostByIdContainer = ({ history, match, postState, getPostByIdFn, clearPostFn }: Props) => {
  useEffect(() => {
    history.listen(() => {
      clearPostFn();
    });
  }, [history, clearPostFn]);
  useEffect(() => {
    getPostByIdFn(match.params.postId);
  }, [getPostByIdFn, match.params.postId]);

  if (postState.loading) return <div>Loading ...</div>;
  if (!postState.post) return <div>Loading ...</div>;

  return (
    <CommonLayout noFooter>
      <GetPostByIdPresenter post={postState.post} />
    </CommonLayout>
  );
};

const mapStateToProps = ({ postState }: IRootState) => ({
  postState,
});

export default withRouter(
  connect(mapStateToProps, { getPostByIdFn, clearPostFn })(GetPostByIdContainer),
);
