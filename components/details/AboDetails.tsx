import { FlowResult } from '~/automations/playwright/helpers';
import ActiveAbo from './ActiveAbo';
import CanceledAbo from './CanceledAbo';
import InactiveAbo from './InactiveAbo';
import PreactiveAbo from './PreActiveAbo';

type Props = {
  serviceData: FlowResult;
};

const AboDetails: React.FC<Props> = ({ serviceData }) => {
  switch (serviceData.membershipStatus) {
    case 'active':
      return <ActiveAbo serviceData={serviceData} />;
    case 'inactive':
      return <InactiveAbo serviceData={serviceData} />;
    case 'canceled':
      return <CanceledAbo serviceData={serviceData} />;
    case 'preactive':
      return <PreactiveAbo serviceData={serviceData} />;
  }
};

export default AboDetails;
