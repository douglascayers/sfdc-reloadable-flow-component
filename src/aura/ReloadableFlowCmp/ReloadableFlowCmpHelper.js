/*
Author: Doug Ayers
Website: https://douglascayers.com
GitHub: https://github.com/DouglasCAyers/sfdc-reloadable-flow-component
License: BSD 3-Clause License
*/
({
    startFlow : function( component ) {

        // name of the flow to load
        var flowName = component.get( 'v.flowName' );

        // if we don't have a flow name yet then do nothing
        if ( $A.util.isEmpty( flowName ) ) {
            return;
        }

        // dynamically creating components is done asynchronously
        // so we use a promise to chain our actions sequentially
        var p = new Promise( function( resolve, reject ) {

            // Ideally, I would like to use the lightning:flow method 'startFlow'
            // to cause a flow component to start or restart on demand, but at the time
            // of this project the method only started the flow once. This meant that
            // the flow was not picking up record data changes because it was not reloading itself.
            //
            // I brought up my use case to product management here:
            // https://org62.lightning.force.com/one/one.app#/sObject/0D50M00003InPo2SAF/view
            //
            // As workaround, we dynamically create and destroy the component to refresh itself.
            // https://developer.salesforce.com/docs/atlas.en-us.210.0.lightning.meta/lightning/js_cb_dynamic_cmp_async.htm

            $A.createComponent(
                'lightning:flow',
                {
                    'aura:id' : 'flow',
                    'onstatuschange' : component.getReference( 'c.handleFlowStatusChange' )
                },
                function( newCmp, status, errorMessage ) {
                    if ( status === 'SUCCESS' ) {
                        resolve( newCmp );
                    } else {
                        reject( errorMessage || status );
                    }
                }
            );

        }).then( $A.getCallback( function( newFlowCmp ) {

            var flowContainer = component.find( 'flowContainer' );

            // not certain that I have to manually destroy the components
            // but the documentation hinted that not doing so might lead to memory leaks
            flowContainer.get( 'v.body' ).forEach( function( cmp, idx ) {
                cmp.destroy();
            });

            flowContainer.set( 'v.body', newFlowCmp );

            // specify your flow input variables
            // https://developer.salesforce.com/docs/atlas.en-us.210.0.lightning.meta/lightning/components_using_flow_inputs_set.htm
            var inputVariables = [
                {
                    name : 'accountId',
                    type : 'String',
                    value : component.get( 'v.recordId' )
                }
            ];

            newFlowCmp.startFlow( flowName, inputVariables );

        })).catch( $A.getCallback( function( err ) {

            console.error( 'Error creating flow component' );
            console.error( err );

        }));

    }
})
/*
BSD 3-Clause License

Copyright (c) 2017, Doug Ayers
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/