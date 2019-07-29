#!/usr/bin/python
# Copyright (c) 2013, 2014-2019 Oracle and/or its affiliates. All rights reserved.


"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__copyright__ = "Copyright (c) 2013, 2014-2019  Oracle and/or its affiliates. All rights reserved."
__ekitversion__ = "@VERSION@"
__ekitrelease__ = "@RELEASE@"
__version__ = "1.0.0.0"
__date__ = "@BUILDDATE@"
__status__ = "@RELEASE@"
__module__ = "ociSubnet"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci
import re
import sys

from facades.ociConnection import OCIVirtualNetworkConnection
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCISubnets(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None, vcn_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.vcn_id = vcn_id
        self.subnets_json = []
        self.subnets_obj = []
        super(OCISubnets, self).__init__(config=config, configfile=configfile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        subnets = oci.pagination.list_call_get_all_results(self.client.list_subnets, compartment_id=compartment_id, vcn_id=self.vcn_id).data
        # Convert to Json object
        self.subnets_json = self.toJson(subnets)
        logger.debug(str(self.subnets_json))
        # Build List of Subnet Objects
        self.subnets_obj = []
        for subnet in self.subnets_json:
            self.subnets_obj.append(OCISubnet(self.config, self.configfile, subnet))
        # Check if the results should be filtered
        if filter is None:
            return self.subnets_json
        else:
            filtered = self.subnets_json[:]
            for key, val in filter.items():
                filtered = [vcn for vcn in filtered if re.compile(val).search(vcn[key])]
            return filtered


class OCISubnet(object):
    def __init__(self, config=None, configfile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.data = data


# Main processing function
def main(argv):

    return


# Main function to kick off processing
if __name__ == "__main__":
    main(sys.argv[1:])